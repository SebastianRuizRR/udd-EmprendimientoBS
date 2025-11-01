export type Student = {
    rut?: string;
    nombre: string;
    carrera?: string;
  };
  
  export type PreSalaConfig = {
    totalAlumnos: number;
    equiposRecomendados: number;
    tamanoPorEquipo: number;
    preArmar: boolean;
  };
  
  export type GrupoArmado = {
    nombre: string;       // “Equipo 1”, “Equipo 2”, …
    integrantes: Student[];
  };
  
  export type PreSalaPayload = {
    roomCode: string;
    alumnos: Student[];
    grupos?: GrupoArmado[];   // presente si preArmar = true
    equiposEsperados: number;
  };
  