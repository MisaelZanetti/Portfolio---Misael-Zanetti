"""Helpers pequeños para consultar MySQL con PyMySQL."""

from contextlib import contextmanager

import pymysql
from flask import current_app


@contextmanager
def get_connection():
    """Abre una conexión por operación y la cierra siempre al terminar."""
    config = current_app.config
    required = ("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")
    missing = [key for key in required if not config.get(key)]
    if missing:
        raise RuntimeError("Faltan variables de base de datos: " + ", ".join(missing))

    connection = pymysql.connect(
        host=config["DB_HOST"],
        port=config["DB_PORT"],
        user=config["DB_USER"],
        password=config["DB_PASSWORD"],
        database=config["DB_NAME"],
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=10,
        read_timeout=20,
        write_timeout=20,
    )
    try:
        yield connection
    finally:
        connection.close()


def fetch_all(sql, params=()):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()


def fetch_one(sql, params=()):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchone()


def execute(sql, params=()):
    """Ejecuta una escritura parametrizada y devuelve el ID generado si existe."""
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            result = cursor.lastrowid
        connection.commit()
        return result
