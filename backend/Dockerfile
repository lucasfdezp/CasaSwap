# Backend PHP de CasaSwap para Railway
FROM php:8.2-apache

# Extensión PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Copiar el código del backend al directorio web de Apache
COPY . /var/www/html/

# Habilitar mod_rewrite (por si se usan rutas amigables)
RUN a2enmod rewrite

# Railway asigna el puerto en la variable $PORT.
# Hacemos que Apache escuche en ese puerto al arrancar.
CMD sh -c "sed -i \"s/Listen 80/Listen ${PORT:-8080}/\" /etc/apache2/ports.conf && \
           sed -i \"s/:80>/:${PORT:-8080}>/\" /etc/apache2/sites-available/000-default.conf && \
           apache2-foreground"
