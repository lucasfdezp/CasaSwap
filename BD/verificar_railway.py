# -*- coding: utf-8 -*-
"""Muestra el contenido de la BD remota para verificar la importación.
Uso: python verificar_railway.py <host> <puerto> <usuario> <password>
"""
import sys
import mysql.connector

host, port, user, password = sys.argv[1:5]
cnx = mysql.connector.connect(host=host, port=int(port), user=user, password=password, database="casaswap")
cur = cnx.cursor()

print("=== USUARIOS ===")
cur.execute("SELECT id, nombre, apellidos, email, puntos FROM usuarios")
for r in cur.fetchall():
    print(f"  {r[0]}. {r[1]} {r[2]} <{r[3]}> - {r[4]} pts")

print("\n=== CASAS ===")
cur.execute("SELECT id, titulo, ciudad, tipo_vivienda, valor_puntos, disponible FROM casas ORDER BY id")
for r in cur.fetchall():
    disp = "disponible" if r[5] == 1 else "no disp."
    print(f"  {r[0]}. {r[1]} ({r[2]}, {r[3]}) - {r[4]} pts - {disp}")

print("\n=== SOLICITUDES ===")
cur.execute("SELECT COUNT(*) FROM solicitudes")
print(f"  Total: {cur.fetchone()[0]}")

cur.close()
cnx.close()
