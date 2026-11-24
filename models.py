"""Clases POO del proyecto (consigna, punto 4: los 4 pilares, comentados donde estan).

Plan:
  ABSTRACCION      clase base abstracta `Registro` (define to_dict() sin implementarlo)
  HERENCIA         Estudio, Experiencia, Tecnologia, Habilidad, Proyecto, Contacto heredan de Registro
  ENCAPSULAMIENTO  Usuario: el password_hash es un atributo privado, solo se compara, nunca se muestra
  POLIMORFISMO     cada clase implementa to_dict() a su manera y la pagina las trata a todas igual
"""
# TODO: escribir las clases con un comentario en cada pilar
