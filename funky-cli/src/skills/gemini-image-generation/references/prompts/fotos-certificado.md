# Prompt — `fotos-certificado`

Use when the user asks for a formal photo for a certificate, ID or official document.
Send exactly the block below as `{{INPUT_USUARIO}}`, with nothing added or reworded.

Requires one portrait as `{{IMAGENES_ADJUNTAS}}`. A group photo, a photo without a face,
or a heavily cropped image cannot satisfy this prompt; say so and ask for another image.

```text
Editar esta fotografía para convertirla en una foto formal para certificado/documento oficial. Mantener exactamente los rasgos faciales, identidad, estructura del rostro, proporciones, tono de piel, cabello y expresión original de la persona, sin alterar ni embellecer el rostro.

Cambiar únicamente la vestimenta a una camisa blanca formal, sencilla y de cuello clásico, con apariencia realista y natural. Colocar un fondo completamente blanco, uniforme y limpio, sin sombras, objetos, texturas ni elementos adicionales.

Mantener una iluminación de estudio profesional, suave y uniforme, con colores naturales y aspecto fotográfico realista. Encuadre tipo fotografía de identificación/certificado: cabeza y hombros centrados, mirando directamente a la cámara, postura recta y composición simétrica.

La imagen debe verse como una fotografía profesional para certificado oficial, sobria, nítida y natural. No cambiar los rasgos faciales ni generar un rostro nuevo. No modificar la edad, forma de ojos, nariz, boca, mandíbula o características distintivas. No aplicar filtros de belleza ni retoque excesivo.
```

## Naming

Default result name: `<source-stem>-certificado`. Append `-2`, `-3` rather than overwrite.

## What to verify before delivering

The prompt's constraints are visual, so a chat that finished does not mean the output
obeys them. Report the file path and say plainly that facial identity and the white
background should be confirmed by the human on the actual image. Never assert that the
face was preserved.
