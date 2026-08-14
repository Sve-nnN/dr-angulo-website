# El robots.txt del sitio no sale solo de este repo

Si abrís `https://drangulocolumna.com/robots.txt` vas a leer unas 66 líneas.
`src/app/robots.ts` produce las últimas. Las primeras 50 las pone Cloudflare
antes de que la respuesta llegue al navegador.

## Anatomía del archivo servido

```
# BEGIN Cloudflare Managed content
User-agent: ClaudeBot
Disallow: /

User-agent: GPTBot
Disallow: /

... (el resto de los rastreadores de IA bloqueados)
# END Cloudflare Managed Content

User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://drangulocolumna.com/sitemap.xml
```

El bloque de arriba es la función de **robots.txt gestionado** de Cloudflare,
que vive en el panel del dominio bajo AI Crawl Control. Cloudflare lo antepone a
lo que responde el origen. No está en ningún archivo de este repositorio y no se
puede editar desde acá.

**Consecuencia práctica:** ninguna edición de `src/app/robots.ts` apaga ese
`Disallow: /`. Si alguien lee solo el código va a concluir que el repo controla
el bloqueo. No lo controla.

## Qué hace igual `robots.ts`

Emite un grupo propio para ClaudeBot que le permite todo el sitio:

```
User-agent: ClaudeBot
Allow: /
Disallow: /api/
```

Sirve de algo por cómo manda fusionar el RFC 9309: un rastreador junta todos los
grupos que aplican a su nombre y, ante dos reglas de la misma longitud de ruta,
gana la menos restrictiva. O sea que este `Allow: /` compite de igual a igual
con el `Disallow: /` gestionado en vez de quedar ignorado.

Es media entrega y conviene decirlo con todas las letras: **el arreglo
autoritativo es el toggle del panel.** No hay forma de garantizar desde el
código cómo resuelve el empate cada implementación.

## Por qué solo ClaudeBot

El resto de los rastreadores de IA bloqueados —GPTBot, Google-Extended, CCBot,
Amazonbot, Applebot-Extended, Bytespider, meta-externalagent— siguen bloqueados
a propósito: son decisiones de protección del contenido clínico del sitio. Lo
que se busca acá es que el sitio sea citable por Claude, no abrir la puerta a
todo el mundo.

OAI-SearchBot, PerplexityBot y Googlebot no están en la lista gestionada y ya
pasan por el grupo genérico `User-agent: *`.

## El paso manual del panel

1. Entrar al dashboard de Cloudflare y elegir el dominio `drangulocolumna.com`.
2. Ir a **AI Crawl Control** (según la versión del panel puede aparecer como
   *Bots* → *robots.txt gestionado*).
3. Dos caminos, cualquiera de los dos sirve:
   - Quitar **ClaudeBot** de la lista de rastreadores de IA bloqueados, dejando
     los demás como están. Es el camino preferido: conserva el resto de los
     bloqueos sin tener que reescribirlos.
   - Desactivar el robots.txt gestionado por completo y dejar que la aplicación
     sirva el suyo. Ojo: esto también levanta los otros siete bloqueos, así que
     habría que trasladarlos a `src/app/robots.ts` antes de apagarlo.
4. Guardar. El cambio se propaga en minutos, no hace falta redeploy.

## Cómo comprobar que quedó

Contra producción, no contra local: en local no hay Cloudflare delante y el
archivo se ve siempre "bien".

```bash
# El bloque gestionado ya no debe mostrar ClaudeBot con Disallow: /
curl -s https://drangulocolumna.com/robots.txt | grep -A2 ClaudeBot

# El archivo completo, para leer el orden de los bloques
curl -s https://drangulocolumna.com/robots.txt
```

Lo que se espera después del cambio: o bien ClaudeBot ya no aparece dentro del
bloque `# BEGIN Cloudflare Managed content`, o bien ese bloque desapareció
entero. En los dos casos, el único grupo de ClaudeBot que queda es el permisivo
que emite la aplicación.
