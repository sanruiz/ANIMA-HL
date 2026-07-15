# Correo: solicitud de cambios DNS (animavillage.com → Vercel)

**Asunto:** Solicitud de cambios DNS para animavillage.com — migración a Vercel

Hola [nombre]:

Estamos migrando el sitio de animavillage.com de Webflow a nuestro nuevo servidor en Vercel. Para completar la migración, necesitamos que actualices los siguientes registros DNS en GoDaddy (donde está administrada la zona del dominio):

**1. Registro A (dominio raíz)**

- Tipo: A
- Nombre/Host: @
- Valor actual: 198.202.211.1 → **Reemplazar por: 76.76.21.21**
- TTL: 600 (o el mínimo disponible)

**2. Registro CNAME (www)**

- Tipo: CNAME
- Nombre/Host: www
- Valor actual: cdn.webflow.com → **Reemplazar por: cname.vercel-dns.com**
- TTL: 600 (o el mínimo disponible)

**Importante — no modificar nada más:**

- No tocar los registros MX ni TXT existentes (correo electrónico y verificaciones seguirían funcionando igual).
- No cambiar los nameservers del dominio; solo los dos registros indicados.

Una vez hechos los cambios, la propagación suele tomar de unos minutos a un par de horas. Vercel emitirá el certificado SSL automáticamente cuando detecte los nuevos registros. Nosotros validamos de nuestro lado y confirmamos que todo quedó funcionando.

¿Nos avisas cuando estén aplicados los cambios, por favor? Si el panel te muestra alguna advertencia o necesitas que lo revisemos juntos, con gusto agendamos una llamada.

Gracias,
Santiago
