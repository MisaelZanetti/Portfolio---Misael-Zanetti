"""Formularios con protección CSRF mediante Flask-WTF."""

from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, SubmitField
from wtforms.validators import DataRequired, Length


class LoginForm(FlaskForm):
    username = StringField(
        "Usuario", validators=[DataRequired(), Length(max=50)]
    )
    password = PasswordField("Contraseña", validators=[DataRequired()])
    submit = SubmitField("Ingresar")
