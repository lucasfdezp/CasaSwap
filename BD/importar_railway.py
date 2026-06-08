# -*- coding: utf-8 -*-
"""Importa un archivo .sql en una base de datos MySQL remota (p. ej. Railway).

Soporta el plugin caching_sha2_password de MySQL 8 (que el cliente de XAMPP/MariaDB
no soporta). La contraseña se pasa como argumento, NO se guarda en el archivo.

Uso:
  python importar_railway.py <host> <puerto> <usuario> <password> <archivo.sql> [base_de_datos]

Si se indica [base_de_datos], las tablas se crean ahí (se omiten CREATE DATABASE/USE),
útil para usar la base 'railway' que Railway crea por defecto.
"""
import sys
import mysql.connector

if len(sys.argv) not in (6, 7):
    print("Uso: python importar_railway.py <host> <puerto> <usuario> <password> <archivo.sql> [base_de_datos]")
    sys.exit(1)

host, port, user, password, sqlfile = sys.argv[1:6]
database = sys.argv[6] if len(sys.argv) == 7 else None

with open(sqlfile, encoding="utf-8") as f:
    sql = f.read()

# Quitar líneas de comentario y dividir en sentencias por ';'
lineas = [l for l in sql.splitlines() if not l.strip().startswith("--")]
sql_limpio = "\n".join(lineas)
sentencias = [s.strip() for s in sql_limpio.split(";") if s.strip()]

# Si se conecta a una BD concreta, omitir CREATE DATABASE y USE
if database:
    sentencias = [s for s in sentencias
                  if not s.upper().startswith("CREATE DATABASE")
                  and not s.upper().startswith("USE ")]

conn_args = dict(host=host, port=int(port), user=user, password=password)
if database:
    conn_args["database"] = database
cnx = mysql.connector.connect(**conn_args)
cur = cnx.cursor()

# Ejecutar cada sentencia
for stmt in sentencias:
    cur.execute(stmt)
cnx.commit()
print(f"Importación completada en la BD '{database or 'casaswap'}' ({len(sentencias)} sentencias).")

# Verificación
cur.execute(f"USE {database or 'casaswap'}")
cur.execute("SHOW TABLES")
print("Tablas:", [r[0] for r in cur.fetchall()])
cur.execute("SELECT COUNT(*) FROM casas")
print("Casas:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM usuarios")
print("Usuarios:", cur.fetchone()[0])

cur.close()
cnx.close()
