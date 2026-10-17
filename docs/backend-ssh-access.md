# Acceso SSH al backend (WordPress / Hostinger)

Para casos que la REST API o GraphQL de WordPress no resuelven bien — sobre
todo campos **multilang** — hay acceso SSH directo al hosting con `wp-cli`.

**Credenciales:** en `.env.local` (nunca se versionan), variables
`WORDPRESS_SSH_HOST`, `WORDPRESS_SSH_PORT`, `WORDPRESS_SSH_USER`,
`WORDPRESS_SSH_PASSWORD`, `WORDPRESS_SSH_WP_PATH`. Pide el archivo a Santiago
si no lo tienes.

## Conectarse

```bash
# Requiere sshpass (brew install hudochenkov/sshpass/sshpass)
export SSHPASS='<WORDPRESS_SSH_PASSWORD>'
sshpass -e ssh -p <WORDPRESS_SSH_PORT> <WORDPRESS_SSH_USER>@<WORDPRESS_SSH_HOST>
```

Una vez dentro, `wp-cli` ya está instalado (`/usr/local/bin/wp`). Hay que
pararse en la carpeta de WordPress para que detecte el sitio:

```bash
cd <WORDPRESS_SSH_WP_PATH>   # ver .env.local
wp post meta get <ID> <campo>
```

## Sin abrir sesión: `scripts/wp-ssh.py`

Para un comando suelto —y para que los agentes puedan correrlo sin que las
credenciales pasen por la línea de comandos— hay un wrapper que lee las
variables de `.env.local`, nunca las imprime, y deja el `cd` ya hecho:

```bash
python3 -I scripts/wp-ssh.py "wp term list event_tag --allow-root --skip-themes"
```

**Cuidado con `--skip-plugins`.** `wp-cli` es más seguro con esa bandera, pero
los tipos de contenido del mall (`event`, `brand`, `deal`, `job_offer`) y sus
taxonomías los registra `sanruiz-mall-core`. Con `--skip-plugins`, `wp term
list event_tag` responde *"Taxonomy event_tag doesn't exist"* y `get_field()`
de ACF devuelve `null`: cualquier comando que toque contenido del mall tiene
que correr con los plugins cargados.

## Por qué no basta con REST/GraphQL para campos multilang

El sitio usa **WP Multilang**, que guarda ambos idiomas en un solo valor de
postmeta con marcadores:

```
[:en]Monday to Sunday[:es]Lunes a domingo[:]
```

`fetchGraphQL` (ver [src/lib/wp.ts](../src/lib/wp.ts)) pasa `?lang=es|en` en la
URL del endpoint para leer el idioma correcto — **esto funciona bien para
lecturas**. El problema es al escribir:

- Un `POST` a `/wp-json/wp/v2/brand/{id}` (o una mutation de WPGraphQL) para
  actualizar un campo ACF **siempre escribe en el idioma "actual" del sitio
  (español)**, sin importar qué `?lang=` lleve la URL. No hay forma de apuntar
  el write al segmento `[:en]...` vía la API pública.
- Si se intenta de todas formas (por ejemplo mandando `?lang=en` esperando que
  actualice el inglés), lo que pasa es que se **sobreescribe el segmento
  español** con el valor que se quería mandar en inglés — corrompiendo el dato
  para los dos idiomas.

`~/reparar-multilang.php` (en el `$HOME` del servidor) es el precedente de
este mismo problema para eventos rotos: escribe directo con `$wpdb` para
esquivar `save_post`, que es lo que aplana el valor multilang al pasar por
REST.

## Cómo escribir un campo multilang correctamente

Actualiza el postmeta completo con los dos idiomas en una sola llamada de
`wp-cli`, sin pasar por REST:

```bash
wp post meta update <ID> days '[:en]Monday to Sunday[:es]Lunes a domingo[:]'
wp post meta update <ID> time '[:en]11:00 AM – 9:00 PM[:es]11:00 AM – 9:00 PM[:]'
```

Para actualizar muchos posts a la vez, un loop de shell simple sirve (ver
historial de este documento / conversaciones de Claude Code para un ejemplo
real con las 42 marcas de Brands).

**Nunca** escribas el marcador `[:xx]` a mano en el editor de WordPress — eso
es solo para escritura directa a DB vía script. Los editores de contenido usan
las pestañas de idioma del admin (ver
[guia-editores-wordpress.md](guia-editores-wordpress.md)), que sí guardan cada
idioma en su segmento correcto.
