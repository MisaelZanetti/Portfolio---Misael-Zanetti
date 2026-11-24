# Portfolio web - Proyecto Integrador

Portfolio full stack: Flask (Python) + Jinja2 + MySQL. Un solo usuario (el admin) puede editar; los visitantes solo miran.

## Como correrlo en tu PC
1. `python -m venv venv` y activarlo
2. `pip install -r requirements.txt`
3. Copiar `.env.example` a `.env` y completar los datos de la base
4. Ejecutar `database/portfolio.sql` en MySQL (en Clever Cloud, desde CREATE TABLE)
5. Crear el administrador con `python crear_usuario.py` (te pide nombre y contraseña; la contraseña se guarda con hash)
6. `flask --app app run --debug`

## Donde esta cada punto de la consigna
| Punto | Donde vive |
|---|---|
| 1. Jinja2 | `templates/` |
| 2. Maquetacion, modelo relacional, diseno fisico, MySQL | `docs/` (diagramas) y `database/portfolio.sql` |
| 3. Iframe, iconos, fuentes | iframe en `templates/proyecto.html`; iconos y fuentes en `templates/base.html` |
| 4. POO con los 4 pilares comentados | `models.py` |
| 5. Responsive (movil, tablet, escritorio) | `static/css/` |
| 6. Animaciones (indicar donde) | `static/js/` con anime.js |
| 7. Framework CSS | opcional; por ahora no se usa |
| 8. Publicacion y Git | Render (app) + Clever Cloud (base) + GitHub |
| 9. Login con hash + Flask-WTF | `forms.py` y rutas de login en `app.py` |
| 10. Diseno integral, logo, favicon | `static/img/` y `static/css/` |
| 11. Documentacion en PDF | `docs/` |
| 12. CV descargable en PDF | ruta `/cv` en `app.py` (el PDF vive en `perfil.cv_archivo`) |
| 13. Defensa oral | entender cada archivo; ver `docs/` |
