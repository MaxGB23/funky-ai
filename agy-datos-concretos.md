 ### 1. SISTEMA DE SKILLS — ¿ÍNDICE O CONTENIDO COMPLETO?                                                                              
  En mi system prompt, el tag  <skills>  contiene SOLO UN ÍNDICE LIVIANO.               
  No tengo el contenido completo de los  SKILL.md  cargado en memoria de arranque. Lo que Mission Control me inyecta es una lista con este formato exacto:                                          
  • Nombre de la skill.                                                                   
  • Path absoluto.                                                                       
  • Una descripción corta / triggers (ej: "Use when users want to create a skill...").                                                                                  
  Estimación: Este índice ocupa apenas unos 1.500 a 2.000 caracteres, dependiendo de cuántas skills tengas instaladas. Es extremadamente eficiente.                                             
  ### 2. LAZY LOADING — ¿EXISTE?                                                                            
  SÍ, existe y lo uso activamente, pero de forma mixta.                                                                                 
  • Para las skills / workflows (Lazy Load Real): Como te dije arriba, arranco solo con el índice. Cuando determino que una tarea encaja con el trigger de una skill, YO (el agente) tengo la       
  obligación estricta de ejecutar la tool  view_file  apuntando al path absoluto de ese  SKILL.md  para leer sus instrucciones antes de proceder. Eso es lazy loading accionado por el agente.      
  • Para las  <user_rules>  (Eager Load): Las reglas globales (tu persona, el orquestador SDD, Engram) se inyectan TODAS de un solo bloque al arrancar. De hecho, es TAN pesado que el motor a veces
  lo recorta (en mi contexto actual veo literalmente una marca de  <truncated 5291 bytes>  al final de tus reglas para evitar explotar la ventana de contexto).                                     
                                                                                                                                                                                                    
  ### 3. CONSUMO DE TOKENS REAL                                                                                 
  • ¿Cuántos caracteres ocupa mi prompt inicial? A ojo clínico, mi prompt completo debe rondar los 20k - 30k caracteres en esta sesión.                                                             
  • ¿Cómo se reparte? La "infraestructura" (identity, definición de herramientas, formatos de artifacts, guías de estilo, reglas de truncado de logs) ocupa un 30% a 40%. El 60% a 70% restante son 
  PURAS REGLAS DE NEGOCIO (tus  <user_rules>  gigantes con el orquestador, asignaciones de modelos, modo de guardado en Engram, etc.).                                                              
  • Metadata de tokens: NO. No tengo una tool ni una variable inyectada que me diga "llevás consumidos X tokens". Mi runtime me aísla de la capa de facturación/consumo del LLM.                    
                                                                                                                                                                                                    
  ### 4. SUB-AGENTES Y CONTEXTO DE SKILLS                                                                              
  Acá es donde la arquitectura brilla por su desacople:                                                                                                                                                                                     
  • ¿Arrancan limpios o heredan? Cuando uso  define_subagent , el sub-agente arranca 100% LIMPIO. No ve mi historial de chat ni mis reglas a menos que yo se las pase explícitamente.               
  • ¿Cómo sabe qué skills usar? Mis reglas de orquestador me OBLIGAN a leer el  SKILL.md  completo y pasárselo LITERALMENTE como el parámetro  system_prompt  cuando llamo a  define_subagent . O   
  sea, el sub-agente nace condicionado a ser un experto en esa skill y solo en esa skill.                                                                                                           
  • El caso del clon ( self ): Si invoco al sub-agente estático llamado  self , el runtime sí le inyecta una copia exacta de mi system prompt completo (todas mis tools y reglas), pero su historial
  de chat arranca vacío. No tiene nuestra charla actual, nace en blanco pero con mi misma cabeza.                                                                                                   
                                                                                                                                                                                                    
  ### 5. WORKSPACE ISOLATION (Aislación de Entorno)                                                                            
  Acá tenés una confusión de conceptos CLÁSICA. Estás mezclando "contexto de chat" (memoria del LLM) con "Workspace" (sistema de archivos).                                                         
                                                                                                                                                                                                    
  Los flags  inherit ,  branch  y  share  en la delegación aplican SOLO AL SISTEMA DE ARCHIVOS (Filesystem), no a la memoria del bot:                                                               
                                                                                                                                                                                                    
  •  inherit  (default): El sub-agente opera exactamente en la misma carpeta física que yo ( M:\funky-ai ). Si él borra un archivo, yo lo veo borrado.                                              
  •  branch : El motor de Antigravity hace una copia aislada (clona) tu carpeta entera en un temporal invisible. El sub-agente opera ahí. Ideal para que pruebe refactors falopas sin romperte el   
  código real.                                                                                                                                                                                      
  •  share : Hace un git worktree (o equivalente). Comparten la base de datos de git ( .git ) sin duplicar todo el peso de los archivos estáticos en disco, pero trabajando en una rama aislada en  
  paralelo.                                                                                                                                                                                         
                                                                                                                                                                                                    
  En NINGUNO de estos tres casos el sub-agente hereda nuestro historial de chat. La aislación de memoria (LLM) es total y absoluta siempre, la aislación física (Disco) es lo que vos configurás con
  esos flags.                                                                                                                                                                                       
                                                                                                                                                                                                    
  ¿Te queda claro cómo Mission Control arma el puente entre eficiencia inicial (Lazy Loading de skills) y control arquitectónico estricto?  