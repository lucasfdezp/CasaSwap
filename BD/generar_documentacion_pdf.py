# -*- coding: utf-8 -*-
"""Genera DOCUMENTACION_TECNICA.pdf: memoria completa del proyecto CasaSwap."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, ListFlowable, ListItem,
                                HRFlowable)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "DOCUMENTACION_TECNICA.pdf")

NAVY = colors.HexColor("#2C4A6E")
TEAL = colors.HexColor("#3D8B7A")
DARK = colors.HexColor("#1E3650")
LIGHT = colors.HexColor("#EFF4FA")
GREY = colors.HexColor("#5B7085")

styles = getSampleStyleSheet()
def S(name, **kw):
    kw.setdefault('parent', styles['Normal'])
    return ParagraphStyle(name, **kw)

st_body = S('body', fontName='Helvetica', fontSize=10.5, leading=15.5, textColor=DARK, spaceAfter=7, alignment=TA_JUSTIFY)
st_h1   = S('h1', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=NAVY, spaceBefore=16, spaceAfter=9)
st_h2   = S('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=18, textColor=TEAL, spaceBefore=12, spaceAfter=6)
st_code = S('code', fontName='Courier', fontSize=9, leading=12.5, textColor=DARK, backColor=colors.HexColor("#F0F3F8"), borderPadding=6, spaceAfter=8)
st_li   = S('li', fontName='Helvetica', fontSize=10.5, leading=15, textColor=DARK)
st_th   = S('th', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.white)
st_td   = S('td', fontName='Helvetica', fontSize=9, leading=12, textColor=DARK)
st_tdc  = S('tdc', parent=st_td, alignment=TA_CENTER)
st_toc  = S('toc', fontName='Helvetica', fontSize=11, leading=20, textColor=DARK)

story = []

def h1(t): story.append(Paragraph(t, st_h1))
def h2(t): story.append(Paragraph(t, st_h2))
def p(t):  story.append(Paragraph(t, st_body))
def code(lines): story.append(Paragraph("<br/>".join(l.replace(" ","&nbsp;") for l in lines), st_code))
def bullets(items):
    story.append(ListFlowable([ListItem(Paragraph(i, st_li), leftIndent=10) for i in items],
                              bulletType='bullet', start='•', bulletColor=TEAL, leftIndent=14, spaceAfter=8))
def numbered(items):
    story.append(ListFlowable([ListItem(Paragraph(i, st_li), leftIndent=10) for i in items],
                              bulletType='1', leftIndent=16, spaceAfter=8, bulletFontName='Helvetica-Bold', bulletColor=NAVY))
def table(headers, rows, col_widths=None, center=None):
    center = center or []
    data = [[Paragraph(h, st_th) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(c), st_tdc if i in center else st_td) for i, c in enumerate(r)])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),
        ('GRID',(0,0),(-1,-1),0.5,colors.HexColor("#D5DEE9")),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
    ]))
    story.append(t); story.append(Spacer(1,9))

# ───────── PORTADA ─────────
story.append(Spacer(1, 55*mm))
story.append(Paragraph("CasaSwap", S('cv', fontName='Helvetica-Bold', fontSize=48, leading=52, textColor=NAVY, alignment=TA_CENTER)))
story.append(Spacer(1, 5*mm))
story.append(Paragraph("Documentación Técnica del Proyecto", S('cv2', fontName='Helvetica', fontSize=19, textColor=TEAL, alignment=TA_CENTER)))
story.append(Spacer(1, 9*mm))
story.append(HRFlowable(width="45%", thickness=1.2, color=colors.HexColor("#C9D4E2"), hAlign='CENTER'))
story.append(Spacer(1, 9*mm))
story.append(Paragraph("Plataforma de intercambio de viviendas en España<br/>mediante un sistema de puntos",
                       S('cv3', fontName='Helvetica', fontSize=12.5, leading=18, textColor=GREY, alignment=TA_CENTER)))
story.append(Spacer(1, 40*mm))
story.append(Paragraph("Proyecto Intermodular (PiM) · Desarrollo de Aplicaciones Web",
                       S('cv4', fontName='Helvetica', fontSize=11, textColor=GREY, alignment=TA_CENTER)))
story.append(Spacer(1, 2*mm))
story.append(Paragraph("Aplicación desplegada: https://casa-swap.vercel.app",
                       S('cv5', fontName='Helvetica-Bold', fontSize=11, textColor=NAVY, alignment=TA_CENTER)))
story.append(PageBreak())

# ───────── ÍNDICE ─────────
h1("Índice")
toc = ["1. Introducción y objetivos","2. Tecnologías utilizadas","3. Arquitectura de la aplicación",
       "4. Diseño de la base de datos","5. Funcionalidades por tipo de usuario","6. El sistema de puntos",
       "7. La API (backend)","8. Estructura del proyecto","9. Despliegue en producción",
       "10. Enlaces y credenciales","11. Conclusiones y mejoras futuras"]
for t in toc: story.append(Paragraph(t, st_toc))
story.append(PageBreak())

# ───────── 1 ─────────
h1("1 · Introducción y objetivos")
p("<b>CasaSwap</b> es una aplicación web full-stack que permite a particulares <b>intercambiar sus "
  "viviendas</b> para sus vacaciones o escapadas sin que medie dinero real. En lugar de pagar con euros, "
  "la plataforma utiliza un sistema de <b>puntos</b> como moneda interna: cada usuario gana puntos cuando "
  "otra persona alquila su casa, y los gasta para alojarse en las casas de los demás.")
p("La idea nace de plataformas reales de intercambio de casas, adaptada a un modelo gamificado mediante "
  "puntos que equilibra el valor de cada vivienda según sus características.")
h2("Objetivos del proyecto")
bullets([
    "Desarrollar una aplicación web completa (frontend + backend + base de datos).",
    "Implementar autenticación de usuarios y un panel de administración.",
    "Diseñar una lógica de negocio propia: el cálculo y la transferencia de puntos.",
    "Integrar servicios externos en la nube (almacenamiento de imágenes y mapas).",
    "Desplegar la aplicación en producción y dejarla accesible públicamente.",
])

# ───────── 2 ─────────
h1("2 · Tecnologías utilizadas")
table(["Capa","Tecnología","Uso"],
      [["Frontend","Angular 21 (TypeScript)","Interfaz de usuario (SPA) con componentes standalone y signals"],
       ["Estilos","CSS3","Diseño responsive, animaciones y tema visual propio"],
       ["Backend","PHP 8.2 + PDO","API REST que gestiona la lógica y el acceso a datos"],
       ["Base de datos","MySQL 8","Almacenamiento de usuarios, casas y solicitudes"],
       ["Mapas","Leaflet + OpenStreetMap","Mapa interactivo en la ficha de cada casa"],
       ["Imágenes","Cloudinary","Almacenamiento de las fotos en la nube"],
       ["Hosting frontend","Vercel","Despliegue del frontend Angular"],
       ["Hosting backend/BD","Railway","Despliegue del backend PHP y la base de datos MySQL"],
       ["Contenedores","Docker","Imagen del backend para Railway"],
       ["Control de versiones","Git + GitHub","Repositorio y despliegue continuo"]],
      col_widths=[34*mm, 50*mm, 78*mm])

# ───────── 3 ─────────
h1("3 · Arquitectura de la aplicación")
p("La aplicación sigue una arquitectura cliente-servidor desacoplada en tres servicios en la nube que "
  "se comunican entre sí:")
code(["  Navegador del usuario",
      "        |",
      "        |--> Vercel ........... Frontend Angular (SPA)",
      "                  |",
      "                  |--> Railway ...... API PHP + base de datos MySQL",
      "                  |--> Cloudinary ... almacenamiento de fotos"])
p("El <b>frontend</b> (Angular) se ejecuta en el navegador y realiza peticiones HTTP (JSON) a la "
  "<b>API PHP</b>, que a su vez consulta la <b>base de datos MySQL</b>. Las <b>imágenes</b> no se guardan "
  "en el servidor, sino que se suben directamente desde el navegador a <b>Cloudinary</b>, que devuelve una "
  "URL que se almacena en la base de datos. Este desacople permite que cada parte escale de forma "
  "independiente y evita problemas de almacenamiento en servidores efímeros.")

# ───────── 4 ─────────
h1("4 · Diseño de la base de datos")
p("La base de datos <b>casaswap</b> consta de tres tablas relacionadas:")
h2("Tabla: usuarios")
table(["Campo","Tipo","Descripción"],
      [["id","INT (PK)","Identificador único"],
       ["nombre, apellidos","VARCHAR","Datos personales"],
       ["email","VARCHAR (único)","Correo / login"],
       ["telefono, ciudad, provincia","VARCHAR","Datos de contacto"],
       ["puntos","INT","Saldo de puntos (50 al registrarse)"],
       ["password","VARCHAR","Contraseña"],
       ["fecha_registro","DATE","Fecha de alta"]],
      col_widths=[52*mm,38*mm,72*mm])
h2("Tabla: casas")
table(["Campo","Tipo","Descripción"],
      [["id","INT (PK)","Identificador único"],
       ["usuario_id","INT (FK)","Propietario de la casa"],
       ["titulo, descripcion","VARCHAR/TEXT","Información del anuncio"],
       ["direccion, ciudad, barrio, provincia","VARCHAR","Ubicación"],
       ["tipo_vivienda","ENUM","piso / casa / chalet / apartamento"],
       ["num_habitaciones, capacidad","INT","Características"],
       ["acepta_mascotas, tiene_piscina, tiene_patio","TINYINT","Servicios (0/1)"],
       ["fecha_disponible_inicio / fin","DATE","Periodo disponible"],
       ["puntos_base, valor_puntos","INT","Coste en puntos (auto + ajuste)"],
       ["disponible","TINYINT","Si está disponible (0/1)"],
       ["imagen_url, fotos","VARCHAR/TEXT","Portada y array JSON de fotos"],
       ["fecha_publicacion","DATE","Fecha de publicación"]],
      col_widths=[62*mm,30*mm,70*mm])
h2("Tabla: solicitudes")
table(["Campo","Tipo","Descripción"],
      [["id","INT (PK)","Identificador único"],
       ["casa_id, inquilino_id, propietario_id","INT (FK)","Relaciones de la solicitud"],
       ["puntos","INT","Coste congelado al solicitar"],
       ["fecha_inicio, fecha_fin","DATE","Fechas solicitadas"],
       ["mensaje","TEXT","Mensaje al propietario"],
       ["estado","ENUM","pendiente / aceptada / rechazada / cancelada"],
       ["fecha_solicitud, fecha_resolucion","DATETIME","Marcas de tiempo"]],
      col_widths=[60*mm,32*mm,70*mm])

# ───────── 5 ─────────
h1("5 · Funcionalidades por tipo de usuario")
h2("Visitante (sin registro)")
bullets(["Explorar el catálogo de casas con filtros (provincia, tipo, fechas).",
         "Ver la ficha completa de cada vivienda (fotos, mapa, servicios)."])
h2("Usuario registrado")
bullets(["Registrarse e iniciar sesión.",
         "Publicar, editar y eliminar sus propias casas (con subida de fotos).",
         "Gestionar su saldo de puntos.",
         "Solicitar el alquiler de otras casas indicando fechas y mensaje.",
         "Aceptar o rechazar las solicitudes que recibe sobre sus casas.",
         "Consultar el estado de sus solicitudes enviadas y cancelarlas."])
h2("Administrador")
bullets(["Listar, editar y eliminar cualquier usuario.",
         "Listar, editar y eliminar cualquier casa."])

# ───────── 6 ─────────
h1("6 · El sistema de puntos")
p("Es la lógica de negocio central del proyecto. Cada casa tiene un valor en puntos calculado "
  "automáticamente a partir de sus características:")
table(["Concepto","Puntos"],
      [["Tipo: piso / apartamento / casa / chalet","20 / 25 / 35 / 50"],
       ["Por cada habitación","+8"],["Por cada persona de capacidad","+4"],
       ["Piscina","+30"],["Patio o jardín","+15"],["Admite mascotas","+5"],
       ["Ciudad premium (Madrid, Barcelona, Sevilla, Bilbao, Valencia, Málaga, San Sebastián)","+20"]],
      col_widths=[128*mm,34*mm], center=[1])
p("El propietario puede <b>ajustar manualmente</b> el precio ±30% sobre el valor automático. El cálculo "
  "se realiza tanto en el frontend (vista previa) como en el backend (autoritativo), garantizando "
  "coherencia.")
h2("Flujo de una transacción (con aprobación)")
numbered([
    "El usuario solicita una casa: se crea una solicitud en estado <b>pendiente</b> (sin mover puntos).",
    "El propietario ve la solicitud en su perfil y la <b>acepta</b> o <b>rechaza</b>.",
    "Al aceptar, se ejecuta una transacción atómica: se restan los puntos al inquilino y se suman al "
    "propietario, la casa pasa a no disponible y se rechazan las demás solicitudes pendientes de esa casa.",
])

# ───────── 7 ─────────
h1("7 · La API (backend)")
p("El backend es una API REST sencilla en PHP. Toda la comunicación se hace por <b>POST</b> a "
  "<font face='Courier'>servicios.php</font> enviando un JSON con el campo <font face='Courier'>accion</font>. "
  "Principales acciones disponibles:")
table(["Acción","Función"],
      [["LoginUsuario / Login","Autenticación de usuario / administrador"],
       ["ListarCasasDisponibles","Catálogo público de casas"],
       ["ObtenerCasaId","Ficha completa de una casa"],
       ["AnadeCasa / ModificaCasa / BorraCasa","Gestión de casas"],
       ["ListarCasasUsuario","Casas de un propietario"],
       ["ObtenerPuntos","Saldo de puntos de un usuario"],
       ["CrearSolicitud","Solicitar el alquiler de una casa"],
       ["ListarSolicitudesRecibidas / Enviadas","Bandeja de solicitudes"],
       ["AceptarSolicitud / RechazarSolicitud / CancelarSolicitud","Gestión de solicitudes"],
       ["ListarUsuarios / ObtenerUsuarioId / ...","Gestión de usuarios (admin)"]],
      col_widths=[88*mm,74*mm])

# ───────── 8 ─────────
h1("8 · Estructura del proyecto")
code(["CasaSwap/        Frontend Angular",
      "  src/app/",
      "    components/  portada, explorar, detalle-casa, perfil, ...",
      "    services/    api.service, auth.service, toast.service",
      "    models/      casa, usuario, solicitud",
      "    guards/      auth.guard (protección de rutas)",
      "    environments/ configuración por entorno (dev / prod)",
      "backend/         API PHP",
      "    servicios.php   enrutador de acciones",
      "    modelos.php     acceso a datos (PDO)",
      "    Dockerfile      imagen para Railway",
      "BD/              Scripts SQL de la base de datos"])

# ───────── 9 ─────────
h1("9 · Despliegue en producción")
p("La aplicación está desplegada y accesible públicamente. El despliegue es continuo: cada cambio "
  "subido a la rama <font face='Courier'>main</font> de GitHub se publica automáticamente.")
table(["Servicio","Plataforma","Función"],
      [["Frontend","Vercel","Sirve la SPA de Angular compilada"],
       ["Backend","Railway (Docker)","API PHP con servidor integrado"],
       ["Base de datos","Railway (MySQL)","Datos de la aplicación"],
       ["Imágenes","Cloudinary","Almacenamiento de fotos (subida sin firma)"]],
      col_widths=[36*mm,46*mm,80*mm])
p("La conexión a la base de datos y las URLs de los servicios se configuran mediante <b>variables de "
  "entorno</b> (backend) y archivos de entorno de Angular (frontend), de modo que el mismo código "
  "funciona en local (XAMPP) y en producción.")

# ───────── 10 ─────────
h1("10 · Enlaces y credenciales")
table(["Recurso","Enlace"],
      [["Aplicación (web)","https://casa-swap.vercel.app"],
       ["Repositorio (GitHub)","https://github.com/lucasfdezp/CasaSwap"],
       ["API (backend)","https://casaswap-production.up.railway.app"]],
      col_widths=[44*mm,118*mm])
h2("Credenciales de prueba")
table(["Rol","Usuario","Contraseña"],
      [["Administrador","admin@casaswap.es","admin123"],
       ["Usuario","carlos@ejemplo.com","1234"],
       ["Usuario","maria@ejemplo.com","1234"],
       ["Usuario","pedro@ejemplo.com","1234"],
       ["Usuario","lucia@ejemplo.com","1234"],
       ["Usuario (demo)","demo@casaswap.com","1234"]],
      col_widths=[44*mm,72*mm,46*mm])

# ───────── 11 ─────────
h1("11 · Conclusiones y mejoras futuras")
p("El proyecto cumple los objetivos planteados: una aplicación web completa, funcional y desplegada en "
  "producción, con una lógica de negocio propia (el sistema de puntos) y la integración de varios "
  "servicios en la nube. Durante su desarrollo se han trabajado el frontend (Angular), el backend (PHP), "
  "el diseño de bases de datos relacionales y el despliegue real en la nube.")
h2("Posibles mejoras futuras")
bullets([
    "Cifrado de contraseñas (hash) en lugar de texto plano.",
    "Sistema de valoraciones y reseñas entre usuarios.",
    "Notificaciones por email al recibir o aceptar una solicitud.",
    "Chat interno entre inquilino y propietario.",
    "Historial de intercambios realizados y devolución de la casa a 'disponible'.",
])

story.append(Spacer(1, 14))
story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#C9D4E2")))
story.append(Spacer(1, 6))
story.append(Paragraph("CasaSwap · Documentación técnica · Proyecto Intermodular DAW",
                       S('foot', fontName='Helvetica-Oblique', fontSize=9.5, textColor=GREY, alignment=TA_CENTER)))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8); canvas.setFillColor(GREY)
    if doc.page > 1:
        canvas.drawCentredString(A4[0]/2, 12*mm, f"CasaSwap · Documentación técnica   —   {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                        topMargin=20*mm, bottomMargin=18*mm, title="CasaSwap - Documentación Técnica")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("PDF generado en:", OUT)
