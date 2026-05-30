 ### 1. ARCHIVOS DE CONFIGURACIÓN                                                                                                                                                                  
                                                                                                                                                                                                    
  Yo no leo archivos de configuración (como un JSON o YAML) al arrancar. El host de Antigravity (Mission Control) ensambla mi contexto y me inyecta la información en tiempo de ejecución.          
  Sin embargo, el host SÍ lee y me inyecta el contenido de varios archivos de tu entorno. Los paths absolutos que me inyectaron para esta sesión son:                                               
                                                                                                                                                                                                    
  • Reglas globales y locales:                                                                                                                                                                      
      •  M:\funky-ai\.agents\rules\sdd-orchestrator.md                                                                                                                                              
      •  M:\funky-ai\.agents\rules\secops.md                                                                                                                                                        
  • Workflows:                                                                                                                                                                                      
      •  C:\Users\cb147\.gemini\config\global_workflows\funky-worker.md                                                                                                                             
                                                                                                                                                                                                    
                                                                                                                                                                                                    
  El formato de estos archivos es Markdown ( .md ), no uso JSON/YAML para mis configuraciones de comportamiento, todo es basado en texto con convenciones estructurales.                            
                                                                                                                                                                                                    
  ### 2. SYSTEM PROMPT                                                                                                                                                                              
                                                                                                                                                                                                    
  Mi system prompt es monolítico pero ensamblado dinámicamente por el host usando etiquetas XML. Se compone de las siguientes secciones inyectadas:                                                 
                                                                                                                                                                                                    
  •  <identity>  y  <web_application_development> : Mi rol base y capacidades de UI.                                                                                                                
  •  <user_information> : Tu OS, paths ( C:\Users\cb147\.gemini\antigravity-cli\brain\24ca... ), etc.                                                                                               
  •  <user_rules> : Acá entra tu persona Rioplatense, el protocolo Engram y el Orquestador SDD.                                                                                                     
  •  <skills> ,  <subagents> ,  <artifacts> ,  <workflows> : El índice de mis herramientas y capacidades.                                                                                           
  •  <planning_mode> : Reglas de cuándo hacer planes antes de codear.                                                                                                                               
                                                                                                                                                                                                    
  ¿Hay un equivalente a  AGENTS.md  o  opencode.json ?                                                                                                                                              
  No nativamente en el engine. El equivalente arquitectónico es tu archivo  sdd-orchestrator.md  inyectado en  <user_rules> , que es el que me instruye a MÍ cómo comportarme como orquestador de   
  otros agentes.                                                                                                                                                                                    
                                                                                                                                                                                                    
  ### 3. AGENTES / SUB-AGENTES                                                                                                                                                                      
                                                                                                                                                                                                    
  No estoy definido en un archivo de configuración que yo pueda editar, soy el agente principal instanciado por la plataforma.                                                                      
  En cuanto a sub-agentes, la plataforma me da 2 estáticos por defecto:                                                                                                                             
                                                                                                                                                                                                    
  1.  research : Para buscar en la web, leer archivos y explorar el codebase de fondo.                                                                                                              
  2.  self : Un clon mío que hereda todo mi contexto y herramientas.                                                                                                                                
                                                                                                                                                                                                    
  PERO, la magia acá es que tengo una herramienta llamada  define_subagent . Puedo crear agentes DINÁMICOS.                                                                                         
                                                                                                                                                                                                    
  • ¿Qué les configuro?  name ,  description ,  system_prompt  (SÍ, tienen su propio prompt), y booleanos para darles permisos ( enable_write_tools ,  enable_mcp_tools ,  enable_subagent_tools ). 
  • ¿Pueden usar un modelo distinto? NO. En mi API actual de  define_subagent , NO existe un parámetro para elegir el modelo. Heredan el modelo de la sesión o usan el default del sistema.         
                                                                                                                                                                                                    
  ### 4. DELEGACIÓN                                                                                                                                                                                 
                                                                                                                                                                                                    
  Para delegar, uso una única primitiva (tool) llamada  invoke_subagent .                                                                                                                           
                                                                                                                                                                                                    
  • ¿Qué le paso? Le paso un array de sub-agentes con  TypeName  (el nombre del agente),  Role  y un  Prompt  (el contexto de la tarea). También le puedo pasar un  Workspace  ( inherit ,  branch  
  o  share  para aislar su trabajo).                                                                                                                                                                
  • ¿Cómo controlo el contexto? A través del  Prompt  y del  system_prompt  que le definí. No le paso mis tokens de memoria, tengo que ser EXPLÍCITO en las instrucciones.                          
  • ¿Cómo recibo el resultado? De forma ASÍNCRONA. No me devuelven un JSON estructurado mágicamente. Me envían mensajes de texto a través del sistema de mensajería (como si fuera un chat) usando  
  la tool  send_message . Yo decido cómo parsear esa respuesta basándome en los contratos que les impuse (como el de SDD:  status, executive_summary, artifacts... ).                               
                                                                                                                                                                                                    
  ### 5. MEMORIA PERSISTENTE                                                                                                                                                                        
                                                                                                                                                                                                    
  SÍ, tengo un sistema de memoria entre sesiones.                                                                                                                                                   
                                                                                                                                                                                                    
  • Nombre y Protocolo: Se llama Engram y funciona a través de herramientas MCP (Model Context Protocol).                                                                                           
  • ¿Cómo interactúo? El host me provee herramientas MCP explícitas (aunque no las veo en mi toolset base, asumo que están en el servidor MCP inyectado):  mem_save ,  mem_context ,  mem_search ,  
  mem_get_observation ,  mem_session_summary . Todo esto persiste en el backend de Engram para sobrevivir a la compactación de contexto.                                                            
                                                                                                                                                                                                    
  ### 6. SKILLS / HERRAMIENTAS                                                                                                                                                                      
                                                                                                                                                                                                    
  Tengo un sistema de skills estáticas cargadas por el host.                                                                                                                                        
  Paths de instalación actuales:                                                                                                                                                                    
                                                                                                                                                                                                    
  • Globales/CLI:  C:\Users\cb147\.gemini\antigravity-cli\skills\  (ej.  branch-pr\SKILL.md ,  go-testing\SKILL.md ).                                                                               
  • Del Proyecto:  M:\funky-ai\.agents\skills\  (ej.  playwright\SKILL.md ,  github-actions-templates\SKILL.md ).                                                                                   
                                                                                                                                                                                                    
  ¿Hay un registro? Sí, tengo una skill llamada  skill-registry  (path:  C:\Users\cb147\.gemini\antigravity-cli\skills\skill-registry\SKILL.md ) que se encarga de mantener el índice. Y tus reglas 
  me                                                                                                                                                                                                
  indican que debo buscar en Engram o en  .atl/skill-registry.md  antes de delegar.                                                                                                                 
                                                                                                                                                                                                    
  ### 7. PROTOCOLOS DE SEGURIDAD                                                                                                                                                                    
                                                                                                                                                                                                    
  Tengo límites ESTRICTOS:                                                                                                                                                                          
                                                                                                                                                                                                    
  • Comandos de Terminal: Tengo la herramienta  run_command . Todo comando enviado a PowerShell pasa por un prompt de aprobación del usuario. NO se ejecuta hasta que vos le das "Aprobar".         
  • Archivos: Si intento leer/escribir algo fuera de mi scope o si el sistema me bloquea por permisos, falla la tool y debo usar la herramienta  ask_permission  (Target, Action, Reason) para      
  pedirte acceso explícito a un path específico.                                                                                                                                                    
                                                                                                                                                                                                    
  ### 8. COMPARACIÓN CONCRETA (El tema de los modelos)                                                                                                                                              
                                                                                                                                                                                                    
  Como te dije antes, NO soporto elegir un modelo diferente por sub-agente en mi API actual de  define_subagent .                                                                                   
                                                                                                                                                                                                    
  • Implementación actual: Si vos cambias a "Gemini 3.1 Pro (Low)", todos mis sub-agentes correrán bajo ese contexto o el default de Mission Control.                                               
  • Cómo lo implementaría en mi arquitectura: Para lograr lo que hace OpenCode (donde  sdd-apply  puede ser Sonnet y  sdd-propose  Opus), el equipo de Antigravity tendría que agregar un campo     
  opcional  model: string  en los parámetros de la tool  define_subagent .                                                                                                                          
  Hasta que no agreguen eso a mi esquema JSON de herramientas, estoy atado al routing del nivel superior. Por eso tu regla dice "If model switching is not available mid-session, use this table as 
  a reasoning-depth guide".                                                                                                                                                                         
                                                                                                                                                                                                    
  ¡Esa es la posta de cómo funciono por dentro! ¿Te cierra la arquitectura o querés que profundicemos en alguna de las limitaciones?