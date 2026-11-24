"""Crea el único usuario administrador del portfolio."""

from getpass import getpass
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
import os


def main():
    # Carga .env desde la carpeta del proyecto, aunque el script se ejecute desde otra ruta.
    load_dotenv(Path(__file__).with_name(".env"))

    username = input("Nombre de usuario: ").strip()
    if not username or len(username) > 50:
        print("El nombre debe tener entre 1 y 50 caracteres.")
        return

    password = getpass("Contraseña: ")
    confirmation = getpass("Repetí la contraseña: ")
    if len(password) < 8:
        print("La contraseña debe tener al menos 8 caracteres.")
        return
    if password != confirmation:
        print("Las contraseñas no coinciden.")
        return

    required = ("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        print("Faltan datos de conexión en .env: " + ", ".join(missing))
        print("Completá .env usando .env.example como guía.")
        return

    try:
        connection = pymysql.connect(
            host=os.environ["DB_HOST"],
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ["DB_NAME"],
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id_usuario FROM usuario LIMIT 1")
                if cursor.fetchone():
                    print("Ya existe un usuario administrador. No se creó otro.")
                    return

                password_hash = generate_password_hash(password)
                cursor.execute(
                    "INSERT INTO usuario (username, password_hash) VALUES (%s, %s)",
                    (username, password_hash),
                )
            connection.commit()
            print(f"Usuario administrador '{username}' creado correctamente.")
        finally:
            connection.close()
    except pymysql.err.IntegrityError:
        print("Ese nombre de usuario ya existe.")
    except (pymysql.MySQLError, ValueError) as error:
        print(f"No se pudo crear el usuario: {error}")


if __name__ == "__main__":
    main()
