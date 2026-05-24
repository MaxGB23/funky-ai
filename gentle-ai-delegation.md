 ### 1. Defino el Subagente (Las Reglas)                                                     
                                                                                              
  Leo el archivo de la skill correspondiente (por ejemplo,  skills/sdd-apply/SKILL.md ) y le  
  inyecto TODO ese Markdown directamente como su  system_prompt .                             
                                                                                              
  Al hacer esto, el subagente nace sabiendo sus contratos, qué tiene prohibido hacer, si debe 
  usar TDD o no, y cómo debe persistir el progreso. Le marco la cancha de forma irreversible. 
  También defino qué herramientas puede usar (ej: le habilito escritura de archivos y         
  terminal).                                                                                  
                                                                                              
  ### 2. Invoco el Subagente (El Trabajo)                                                     
                                                                                              
  Una vez creado, lo invoco pasándole un  Prompt  hiperespecífico y acotado. Si recordás la   
  sesión anterior cuando lancé el apply, le pasé exactamente esto:                            
                                                                                              
  • El modo de almacenamiento ( openspec ).                                                   
  • La estrategia de despliegue ( single-pr ).                                                
  • La lista exacta de tareas ( tasks.md ).                                                   
  • Los contratos de código que NO podía alterar (la firma de los hooks).                     
                                                                                              
  En resumen: Yo (como Orquestador) tengo la visión global, hablo con vos, leo la memoria y   
  tomo las decisiones arquitectónicas. El Subagente es mano de obra súper calificada pero con 
  una visión de túnel: solo ejecuta su bloque obedeciendo mi contexto. Yo diseño el plano, él 
  pega los ladrillos.                     