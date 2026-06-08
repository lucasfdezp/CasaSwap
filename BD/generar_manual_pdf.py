# -*- coding: utf-8 -*-
"""Genera MANUAL_DE_USUARIO.pdf a partir del contenido del manual de CasaSwap.

La ruta de salida se calcula relativa a la ubicación de este script (carpeta BD/),
por lo que funciona aunque se renombre la carpeta del proyecto.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, ListFlowable, ListItem,
                                HRFlowable)

# Carpeta raíz del proyecto = carpeta padre de BD/ (donde está este script)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "MANUAL_DE_USUARIO.pdf")

NAVY = colors.HexColor("#2C4A6E")
TEAL = colors.HexColor("#3D8B7A")
DARK = colors.HexColor("#1E3650")
LIGHT = colors.HexColor("#EFF4FA")
GREY = colors.HexColor("#5B7085")

styles = getSampleStyleSheet()

def S(name, **kw):
    kw.setdefault('parent', styles['Normal'])
    return ParagraphStyle(name, **kw)

st_body   = S('body', fontName='Helvetica', fontSize=10.5, leading=15.5, textColor=DARK, spaceAfter=7)
st_h1     = S('h1', fontName='Helvetica-Bold', fontSize=19, leading=23, textColor=NAVY, spaceBefore=18, spaceAfter=10)
st_h2     = S('h2', fontName='Helvetica-Bold', fontSize=14.5, leading=19, textColor=TEAL, spaceBefore=14, spaceAfter=7)
st_h3     = S('h3', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=NAVY, spaceBefore=10, spaceAfter=5)
st_code   = S('code', fontName='Courier', fontSize=9.5, leading=13, textColor=DARK,
              backColor=colors.HexColor("#F0F3F8"), borderPadding=6, leftIndent=4, spaceAfter=8)
st_li     = S('li', fontName='Helvetica', fontSize=10.5, leading=15, textColor=DARK)
st_quote  = S('quote', fontName='Helvetica-Oblique', fontSize=10, leading=14, textColor=GREY,
              leftIndent=10, borderColor=TEAL, spaceAfter=8)
st_th      = S('th', fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=colors.white)
st_td      = S('td', fontName='Helvetica', fontSize=9.5, leading=12.5, textColor=DARK)
st_td_c    = S('tdc', parent=st_td, alignment=TA_CENTER)

story = []

# ---------- PORTADA ----------
story.append(Spacer(1, 70*mm))
story.append(Paragraph("CasaSwap", S('cover', fontName='Helvetica-Bold', fontSize=46, leading=50,
                                      textColor=NAVY, alignment=TA_CENTER)))
story.append(Spacer(1, 6*mm))
story.append(Paragraph("Manual de Usuario", S('cover2', fontName='Helvetica', fontSize=20,
                                               textColor=TEAL, alignment=TA_CENTER)))
story.append(Spacer(1, 10*mm))
story.append(HRFlowable(width="40%", thickness=1.2, color=colors.HexColor("#C9D4E2"),
                        hAlign='CENTER'))
story.append(Spacer(1, 10*mm))
story.append(Paragraph("Plataforma de intercambio de casas en España<br/>mediante un sistema de puntos",
                       S('cover3', fontName='Helvetica', fontSize=12, leading=18,
                         textColor=GREY, alignment=TA_CENTER)))
story.append(Spacer(1, 55*mm))
story.append(Paragraph("Proyecto Intermodular (PiM) &nbsp;·&nbsp; Versión 1.0",
                       S('cover4', fontName='Helvetica', fontSize=11, textColor=GREY,
                         alignment=TA_CENTER)))
story.append(PageBreak())

def heading(txt, style):
    story.append(Paragraph(txt, style))

def para(txt):
    story.append(Paragraph(txt, st_body))

def code(lines):
    txt = "<br/>".join(l.replace(" ", "&nbsp;") for l in lines)
    story.append(Paragraph(txt, st_code))

def quote(txt):
    story.append(Paragraph("&nbsp;&nbsp;» " + txt, st_quote))

def bullets(items):
    flow = [ListItem(Paragraph(i, st_li), leftIndent=10) for i in items]
    story.append(ListFlowable(flow, bulletType='bullet', start='•', bulletColor=TEAL,
                              leftIndent=14, spaceAfter=8))

def numbered(items):
    flow = [ListItem(Paragraph(i, st_li), leftIndent=10) for i in items]
    story.append(ListFlowable(flow, bulletType='1', leftIndent=16, spaceAfter=8,
                              bulletFontName='Helvetica-Bold', bulletColor=NAVY))

def table(headers, rows, col_widths=None, center_cols=None):
    center_cols = center_cols or []
    data = [[Paragraph(h, st_th) for h in headers]]
    for r in rows:
        row = []
        for ci, cell in enumerate(r):
            row.append(Paragraph(str(cell), st_td_c if ci in center_cols else st_td))
        data.append(row)
    t = Table(data, colWidths=col_widths, repeatRows=1)
    ts = [
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D5DEE9")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]
    t.setStyle(TableStyle(ts))
    story.append(t)
    story.append(Spacer(1, 9))

# ---------- 1 ----------
heading("1 · ¿Qué es CasaSwap?", st_h1)
para("CasaSwap es una aplicación web para <b>intercambiar viviendas entre particulares</b> "
     "sin dinero de por medio. En lugar de pagar con euros, los usuarios usan <b>puntos</b> "
     "(una moneda interna): publicas tu casa, ganas puntos cuando alguien la alquila, y gastas "
     "esos puntos para alojarte en las casas de otros.")
heading("Características principales", st_h3)
bullets([
    "Catálogo de viviendas con buscador por provincia, tipo y <b>fechas disponibles</b>.",
    "Ficha detallada de cada casa al estilo Airbnb: galería de fotos, <b>mapa real</b>, "
    "servicios (piscina, patio, mascotas) y disponibilidad.",
    "<b>Sistema de puntos</b> que valora cada casa automáticamente según sus características.",
    "<b>Solicitudes de alquiler con aprobación</b>: el propietario decide a quién acepta.",
    "Panel de administración para gestionar usuarios y casas.",
])
heading("Tecnologías", st_h3)
bullets([
    "<b>Frontend:</b> Angular 21 (standalone components, signals).",
    "<b>Backend:</b> PHP + PDO (API REST en servicios.php).",
    "<b>Base de datos:</b> MySQL / MariaDB.",
    "<b>Mapas:</b> Leaflet + OpenStreetMap.",
])

# ---------- 2 ----------
heading("2 · Requisitos e instalación", st_h1)
heading("Requisitos previos", st_h3)
bullets([
    "<b>XAMPP</b> (Apache + MySQL/MariaDB) instalado.",
    "<b>Node.js</b> y <b>Angular CLI</b> (npm install -g @angular/cli) para el frontend.",
])
heading("Estructura del proyecto", st_h3)
code(["PiM/",
      "  CasaSwap/   -> Aplicación Angular (frontend)",
      "  backend/    -> Archivos PHP (API)",
      "  BD/         -> Scripts SQL de la base de datos"])
heading("Instalación de la base de datos", st_h3)
para("Abre <b>phpMyAdmin</b> (http://localhost/phpmyadmin) e importa los scripts en este orden:")
table(["#", "Archivo", "Qué hace"],
      [["1", "casaswap.sql", "Crea la base de datos, las tablas y los datos iniciales"],
       ["2", "instalar_extras.sql", "Añade puntos, atributos de casa y la tabla de solicitudes"],
       ["3", "corregir_datos_casas.sql", "Datos coherentes + fotos + fechas de las 4 casas base"],
       ["4", "mas_pisos.sql", "Añade más pisos de ejemplo y el propietario de prueba"],
       ["5", "fijar_precio_albaicin.sql", "Deja un piso a 50 créditos para pruebas"]],
      col_widths=[12*mm, 55*mm, 95*mm], center_cols=[0])
quote("Para los scripts 2 a 5, primero haz clic en la base de datos «casaswap» en la "
      "columna izquierda y luego ve a Importar.")
heading("Despliegue del backend (PHP)", st_h3)
para("Copia los archivos de backend/ dentro de la carpeta de Apache:")
code(["C:\\xampp\\htdocs\\casaswap\\"])
quote("Cada vez que se modifique un .php hay que volver a copiarlo a esa carpeta.")

# ---------- 3 ----------
heading("Aplicación desplegada", st_h3)
para("La aplicación está disponible online en: <b>https://casa-swap.vercel.app</b>. "
     "También puede ejecutarse en local siguiendo los pasos de instalación.")

heading("3 · Puesta en marcha", st_h1)
numbered([
    "En el <b>Panel de control de XAMPP</b>, arranca <b>Apache</b> y <b>MySQL</b> (en verde).",
    "Abre una terminal en la carpeta CasaSwap/ y ejecuta:",
])
code(["npm install      (solo la primera vez)",
      "ng serve -o"])
para("La aplicación se abre en <b>http://localhost:4200</b>. El frontend habla con el backend "
     "a través de http://localhost/casaswap/servicios.php.")

# ---------- 4 ----------
heading("4 · Tipos de usuario", st_h1)
table(["Rol", "Cómo accede", "Qué puede hacer"],
      [["Visitante", "Acceso libre", "Explorar casas y ver fichas. No puede contactar ni solicitar."],
       ["Usuario registrado", "Email + contraseña", "Publicar casas, ganar/gastar puntos, solicitar alquileres y gestionar solicitudes."],
       ["Administrador", "Credenciales especiales", "Gestionar (ver/editar/borrar) todos los usuarios y casas."]],
      col_widths=[38*mm, 38*mm, 86*mm])

# ---------- 5 ----------
heading("5 · El sistema de puntos", st_h1)
para("Los puntos son la <b>moneda interna</b> de CasaSwap.")
heading("Saldo inicial", st_h3)
para("Todo usuario nuevo arranca con <b>50 puntos</b>.")
heading("Cómo se calcula el valor de una casa", st_h3)
table(["Concepto", "Puntos"],
      [["Tipo: piso", "20"], ["Tipo: apartamento", "25"], ["Tipo: casa", "35"],
       ["Tipo: chalet", "50"], ["Por cada habitación", "+8"],
       ["Por cada persona de capacidad", "+4"], ["Tiene piscina", "+30"],
       ["Tiene patio / jardín", "+15"], ["Admite mascotas", "+5"],
       ["Ciudad premium (Madrid, Barcelona, Sevilla, Bilbao, Valencia, Málaga, San Sebastián)", "+20"]],
      col_widths=[130*mm, 32*mm], center_cols=[1])
quote("Ejemplo: un piso en Sevilla con 2 habitaciones, capacidad 4 y que admite mascotas: "
      "20 + (2x8) + (4x4) + 5 + 20 = 77 puntos.")
para("El propietario puede <b>ajustar manualmente</b> el precio ±30% sobre el valor automático "
     "mediante un control deslizante al publicar la casa.")
heading("Cómo ganar y gastar puntos", st_h3)
bullets([
    "<b>Ganas</b> puntos cuando aceptas la solicitud de alguien que quiere tu casa.",
    "<b>Gastas</b> puntos cuando el propietario de otra casa acepta tu solicitud.",
    "Los puntos solo se transfieren <b>cuando el propietario acepta</b> (no antes).",
])

# ---------- 6 ----------
heading("6 · Guía de uso paso a paso", st_h1)
heading("6.1 · Registro e inicio de sesión", st_h3)
numbered([
    "Pulsa <b>«Registrarse gratis»</b> en la barra superior.",
    "Rellena tus datos (nombre, email, contraseña...).",
    "Inicia sesión con tu email y contraseña.",
    "Al entrar verás tu <b>saldo de puntos</b> en la barra de navegación.",
])
heading("6.2 · Explorar casas", st_h3)
bullets([
    "Filtra por <b>provincia</b> y <b>tipo de vivienda</b> con los desplegables.",
    "Selecciona un rango de <b>fechas</b>: solo se mostrarán las casas disponibles en ellas.",
    "Cada tarjeta muestra el <b>coste en puntos</b> y los servicios (piscina, patio, mascotas).",
])
heading("6.3 · Ver la ficha de una casa", st_h3)
bullets([
    "<b>Galería de fotos</b> (clic para ampliar a pantalla completa).",
    "Sección <b>«Lo que ofrece»</b> con los servicios disponibles.",
    "<b>Fechas de disponibilidad</b> de la vivienda.",
    "<b>Mapa real</b> con la ubicación (barrio + ciudad).",
    "<b>Descripción</b> detallada y datos del propietario.",
])
heading("6.4 · Publicar tu casa", st_h3)
numbered([
    "Ve a <b>«Mi perfil»</b> y pulsa <b>«+ Añadir casa»</b>.",
    "Rellena los datos: título, descripción, dirección, ciudad, barrio, provincia, tipo, habitaciones y capacidad.",
    "Marca las <b>características</b> (piscina, patio, mascotas): verás cómo suben los puntos.",
    "Indica las <b>fechas de disponibilidad</b>.",
    "Ajusta el <b>valor en puntos</b> con el deslizante (o deja el sugerido).",
    "Sube un <b>mínimo de 3 fotos</b> y elige una como <b>portada</b>.",
    "Pulsa <b>«Publicar casa»</b>.",
])
heading("6.5 · Solicitar el alquiler de una casa", st_h3)
numbered([
    "Entra en la ficha de la casa que te interesa.",
    "En la tarjeta de la derecha verás el <b>coste en puntos</b> y tu saldo.",
    "Pulsa <b>«Solicitar alquiler»</b>.",
    "Elige las <b>fechas</b> y escribe un <b>mensaje</b> (opcional) para el propietario.",
    "Pulsa <b>«Confirmar solicitud»</b>.",
])
quote("Los puntos aún no se descuentan: quedan reservados hasta que el propietario decida.")
heading("6.6 · Gestionar solicitudes (propietario)", st_h3)
para("En <b>«Mi perfil»</b>, abajo, hay dos paneles:")
bullets([
    "<b>Solicitudes recibidas:</b> peticiones de otros usuarios sobre tus casas. Puedes "
    "<b>Aceptar</b> (se transfieren los puntos y la casa pasa a «no disponible») o <b>Rechazar</b>.",
    "<b>Mis solicitudes enviadas:</b> el estado de tus peticiones (pendiente, aceptada, "
    "rechazada). Puedes <b>Cancelar</b> las que sigan pendientes.",
])
para("Al <b>aceptar</b> una solicitud: se descuentan los puntos al inquilino y se te suman a ti; "
     "la casa se marca como no disponible; y el resto de solicitudes pendientes de esa casa se "
     "rechazan automáticamente.")
heading("6.7 · Panel de administración", st_h3)
bullets([
    "<b>Usuarios:</b> listar, editar y eliminar usuarios.",
    "<b>Casas:</b> listar, editar y eliminar cualquier casa.",
])

# ---------- 7 ----------
heading("7 · Credenciales de prueba", st_h1)
heading("Administrador", st_h3)
code(["Email:       admin@casaswap.es",
      "Contraseña:  admin123"])
heading("Usuarios de ejemplo (todos con 50 puntos iniciales)", st_h3)
table(["Nombre", "Email", "Contraseña", "Ciudad"],
      [["Carlos García", "carlos@ejemplo.com", "1234", "Sevilla"],
       ["María Fernández", "maria@ejemplo.com", "1234", "Bilbao"],
       ["Pedro Martínez", "pedro@ejemplo.com", "1234", "Madrid"],
       ["Lucía Pérez", "lucia@ejemplo.com", "1234", "Barcelona"],
       ["Ana Demo (pruebas)", "demo@casaswap.com", "1234", "Granada"]],
      col_widths=[42*mm, 52*mm, 35*mm, 33*mm], center_cols=[2])
heading("Probar el sistema de puntos de principio a fin", st_h3)
numbered([
    "Inicia sesión con un usuario (p. ej. carlos@ejemplo.com / 1234, tiene 50 puntos).",
    "Busca el «Estudio luminoso en Zaragoza» (37 pts) o el «Piso con encanto en el Albaicín» (50 pts).",
    "Solicita el alquiler eligiendo fechas.",
    "Cierra sesión e inicia con el <b>propietario</b> de esa casa "
    "(Pedro para el estudio, demo@casaswap.com para el Albaicín).",
    "Ve a <b>Mi perfil → Solicitudes recibidas</b> y pulsa <b>Aceptar</b>.",
    "Comprueba cómo los puntos pasan de un usuario a otro.",
])

# ---------- 8 ----------
heading("8 · Resolución de problemas", st_h1)
table(["Problema", "Causa probable", "Solución"],
      [["Las casas no cargan / «Error de conexión»", "Apache o MySQL apagados", "Arráncalos en el panel de XAMPP"],
       ["El saldo de puntos sale 0", "Sesión antigua en el navegador", "Cierra sesión y vuelve a iniciarla"],
       ["Las fechas salen en blanco", "Falta el idioma español de fechas", "Reinicia ng serve (ya configurado en main.ts)"],
       ["Las fotos subidas no se ven", "El proyecto no está en htdocs/casaswap", "Copia el backend a C:/xampp/htdocs/casaswap"],
       ["Un cambio en un .php no surte efecto", "El PHP no se copió a htdocs", "Vuelve a copiar el archivo modificado"],
       ["«Unknown database casaswap» al importar", "No seleccionaste la BD antes de importar", "Haz clic en casaswap y reintenta"]],
      col_widths=[55*mm, 50*mm, 57*mm])

story.append(Spacer(1, 12))
story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#C9D4E2")))
story.append(Spacer(1, 6))
story.append(Paragraph("CasaSwap · Intercambia tu casa, descubre España. Sin pagos. Sin agencias.",
                       S('foot', fontName='Helvetica-Oblique', fontSize=9.5, textColor=GREY,
                         alignment=TA_CENTER)))

# ---------- Pie de página con numeración ----------
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GREY)
    if doc.page > 1:
        canvas.drawCentredString(A4[0]/2, 12*mm, f"CasaSwap · Manual de Usuario   —   {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22*mm, rightMargin=22*mm,
                        topMargin=20*mm, bottomMargin=20*mm,
                        title="CasaSwap - Manual de Usuario")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("PDF generado en:", OUT)
