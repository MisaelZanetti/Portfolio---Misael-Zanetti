"""Aplicación Flask del portfolio: páginas públicas y acceso del administrador."""

from io import BytesIO

from flask import (
    Flask,
    abort,
    flash,
    redirect,
    render_template,
    send_file,
    url_for,
)
from flask_login import (
    LoginManager,
    UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from pymysql.err import MySQLError
from werkzeug.security import check_password_hash

from config import Config
from db import fetch_all, fetch_one
from forms import LoginForm


login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.login_message = "Iniciá sesión para acceder a esa página."
login_manager.login_message_category = "info"


class Usuario(UserMixin):
    """Usuario autenticable almacenado en la tabla `usuario`."""

    def __init__(self, id_usuario, username, password_hash=None):
        self.id = str(id_usuario)
        self.username = username
        self.password_hash = password_hash


@login_manager.user_loader
def cargar_usuario(user_id):
    try:
        fila = fetch_one(
            "SELECT id_usuario, username FROM usuario WHERE id_usuario = %s",
            (user_id,),
        )
    except (MySQLError, RuntimeError):
        return None
    if fila is None:
        return None
    return Usuario(fila["id_usuario"], fila["username"])


def crear_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    login_manager.init_app(app)

    @app.get("/")
    def inicio():
        return render_template("index.html")

    @app.get("/sobre-mi")
    def sobre_mi():
        perfil = fetch_one(
            "SELECT nombre, titulo, descripcion FROM perfil ORDER BY id_perfil LIMIT 1"
        )
        habilidades = fetch_all(
            "SELECT nombre, tipo, descripcion, nivel FROM habilidad ORDER BY tipo, nombre"
        )
        tecnologias = fetch_all(
            "SELECT nombre, icono, nivel FROM tecnologia ORDER BY nombre"
        )
        return render_template(
            "sobre_mi.html",
            perfil=perfil,
            habilidades=habilidades,
            tecnologias=tecnologias,
        )

    @app.get("/estudios")
    def estudios():
        estudios = fetch_all(
            "SELECT institucion, titulo, fecha_inicio, fecha_fin "
            "FROM estudio ORDER BY fecha_inicio DESC"
        )
        experiencias = fetch_all(
            "SELECT empresa, puesto, fecha_inicio, fecha_fin "
            "FROM experiencia ORDER BY fecha_inicio DESC"
        )
        return render_template(
            "estudios.html", estudios=estudios, experiencias=experiencias
        )

    @app.get("/proyectos")
    def proyectos():
        filas = fetch_all(
            "SELECT id_proyecto, titulo, resumen, anio, color, imagen "
            "FROM proyecto ORDER BY anio DESC, id_proyecto DESC"
        )
        return render_template("proyectos.html", proyectos=filas)

    @app.get("/proyecto/<int:proyecto_id>")
    def proyecto(proyecto_id):
        detalle = fetch_one(
            "SELECT id_proyecto, titulo, resumen, descripcion, anio, color, imagen, "
            "link_repo, link_demo FROM proyecto WHERE id_proyecto = %s",
            (proyecto_id,),
        )
        if detalle is None:
            abort(404)
        imagenes = fetch_all(
            "SELECT ruta, texto_alt, orden FROM proyecto_imagen "
            "WHERE id_proyecto = %s ORDER BY orden, id_imagen",
            (proyecto_id,),
        )
        tecnologias = fetch_all(
            "SELECT t.nombre, t.icono FROM tecnologia t "
            "JOIN proyecto_tecnologia pt ON pt.id_tecnologia = t.id_tecnologia "
            "WHERE pt.id_proyecto = %s ORDER BY t.nombre",
            (proyecto_id,),
        )
        return render_template(
            "proyecto.html",
            proyecto=detalle,
            imagenes=imagenes,
            tecnologias=tecnologias,
        )

    @app.get("/cv")
    def descargar_cv():
        perfil = fetch_one(
            "SELECT cv_nombre, cv_archivo FROM perfil "
            "WHERE cv_archivo IS NOT NULL ORDER BY id_perfil LIMIT 1"
        )
        if not perfil:
            abort(404, description="Todavía no hay un CV cargado.")
        return send_file(
            BytesIO(perfil["cv_archivo"]),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=perfil["cv_nombre"] or "CV.pdf",
        )

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("admin"))

        form = LoginForm()
        if form.validate_on_submit():
            fila = fetch_one(
                "SELECT id_usuario, username, password_hash FROM usuario WHERE username = %s",
                (form.username.data.strip(),),
            )
            if fila and check_password_hash(fila["password_hash"], form.password.data):
                login_user(Usuario(fila["id_usuario"], fila["username"]))
                flash("Sesión iniciada.", "success")
                return redirect(url_for("admin"))
            flash("Usuario o contraseña incorrectos.", "error")
        return render_template("login.html", form=form)

    @app.post("/logout")
    @login_required
    def logout():
        logout_user()
        flash("Sesión cerrada.", "success")
        return redirect(url_for("inicio"))

    @app.get("/admin")
    @login_required
    def admin():
        resumen = {
            "proyectos": fetch_all(
                "SELECT id_proyecto, titulo, anio FROM proyecto "
                "ORDER BY anio DESC, id_proyecto DESC"
            ),
            "estudios": fetch_all(
                "SELECT id_estudio, institucion, titulo FROM estudio "
                "ORDER BY fecha_inicio DESC"
            ),
            "experiencias": fetch_all(
                "SELECT id_experiencia, empresa, puesto FROM experiencia "
                "ORDER BY fecha_inicio DESC"
            ),
            "tecnologias": fetch_all(
                "SELECT id_tecnologia, nombre, nivel FROM tecnologia ORDER BY nombre"
            ),
            "habilidades": fetch_all(
                "SELECT id_habilidad, nombre, tipo FROM habilidad ORDER BY nombre"
            ),
            "contactos": fetch_all(
                "SELECT id_contacto, nombre, tipo, valor FROM contacto ORDER BY nombre"
            ),
        }
        return render_template("admin/panel.html", resumen=resumen)

    @app.errorhandler(404)
    def pagina_no_encontrada(error):
        return "Página no encontrada.", 404

    return app


app = crear_app()


if __name__ == "__main__":
    app.run(debug=True)
