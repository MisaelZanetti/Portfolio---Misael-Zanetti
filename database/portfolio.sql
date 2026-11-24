-- =====================================================
-- Portfolio de Misael - Script de creacion para MySQL 8
-- =====================================================

-- SOLO EN TU PC (local): descomenta estas dos lineas.
-- En Clever Cloud la base de datos ya viene creada: NO las ejecutes,
-- conectate a esa base y corre directamente desde "CREATE TABLE".
-- CREATE DATABASE IF NOT EXISTS portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE portfolio;

-- 1) Login: una sola fila (el admin)
CREATE TABLE usuario (
  id_usuario    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Datos personales: una sola fila, 1 a 1 con usuario
CREATE TABLE perfil (
  id_perfil   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario  INT UNSIGNED NOT NULL,
  nombre      VARCHAR(100) NOT NULL,
  titulo      VARCHAR(100),
  descripcion TEXT,
  cv_nombre   VARCHAR(150),              -- nombre con el que se descarga, ej: CV_Misael.pdf
  cv_archivo  MEDIUMBLOB,                -- el PDF del CV guardado en la base (hasta 16 MB)
  PRIMARY KEY (id_perfil),
  UNIQUE KEY uq_perfil_usuario (id_usuario),
  CONSTRAINT fk_perfil_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Contactos (se muestran en el footer): mail, telefono o enlaces
CREATE TABLE contacto (
  id_contacto INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)  NOT NULL,
  tipo        ENUM('email','telefono','enlace') NOT NULL,
  valor       VARCHAR(255) NOT NULL,
  icono       VARCHAR(100),
  PRIMARY KEY (id_contacto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Estudios cursados
CREATE TABLE estudio (
  id_estudio   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  institucion  VARCHAR(120) NOT NULL,
  titulo       VARCHAR(120) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NULL,
  PRIMARY KEY (id_estudio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Experiencia laboral
CREATE TABLE experiencia (
  id_experiencia INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa        VARCHAR(120) NOT NULL,
  puesto         VARCHAR(120) NOT NULL,
  fecha_inicio   DATE NOT NULL,
  fecha_fin      DATE NULL,
  PRIMARY KEY (id_experiencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) Tecnologias (herramientas concretas)
CREATE TABLE tecnologia (
  id_tecnologia INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(50) NOT NULL,
  icono         VARCHAR(100),
  nivel         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id_tecnologia),
  UNIQUE KEY uq_tecnologia_nombre (nombre),
  CONSTRAINT ck_tecnologia_nivel CHECK (nivel BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) Habilidades blandas y duras
CREATE TABLE habilidad (
  id_habilidad INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(80) NOT NULL,
  tipo         ENUM('blanda','dura') NOT NULL,
  descripcion  VARCHAR(255),
  nivel        TINYINT UNSIGNED NULL,
  PRIMARY KEY (id_habilidad),
  CONSTRAINT ck_habilidad_nivel CHECK (nivel IS NULL OR nivel BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) Proyectos
CREATE TABLE proyecto (
  id_proyecto INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(120) NOT NULL,
  resumen     VARCHAR(255),
  descripcion TEXT,
  anio        YEAR NOT NULL,
  color       CHAR(7) NOT NULL,          -- hex del fondo en hover, ej: #2D5BFF
  imagen      VARCHAR(255),              -- imagen de portada
  link_repo   VARCHAR(255),
  link_demo   VARCHAR(255),
  PRIMARY KEY (id_proyecto),
  CONSTRAINT ck_proyecto_color CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) Imagenes de cada proyecto (1 a N)
CREATE TABLE proyecto_imagen (
  id_imagen   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_proyecto INT UNSIGNED NOT NULL,
  ruta        VARCHAR(255) NOT NULL,
  texto_alt   VARCHAR(255),
  orden       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id_imagen),
  CONSTRAINT fk_pi_proyecto FOREIGN KEY (id_proyecto)
    REFERENCES proyecto (id_proyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10) Tabla intermedia: relacion muchos a muchos proyecto <-> tecnologia
CREATE TABLE proyecto_tecnologia (
  id_proyecto   INT UNSIGNED NOT NULL,
  id_tecnologia INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_proyecto, id_tecnologia),
  CONSTRAINT fk_pt_proyecto FOREIGN KEY (id_proyecto)
    REFERENCES proyecto (id_proyecto) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tecnologia FOREIGN KEY (id_tecnologia)
    REFERENCES tecnologia (id_tecnologia) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin (ejecutalo despues de generar el hash):
-- INSERT INTO usuario (username, password_hash) VALUES ('admin', 'PEGA_ACA_EL_HASH');
