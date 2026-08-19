export type InstitucionBanos = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  elevation?: number;
  parroquia?: string;
};

export const INSTITUCIONES_BANOS: InstitucionBanos[] = [
  {
    id: 'inst-1',
    name: 'Escuela de Educación Básica Pablo Arturo Suárez',
    longitude: -78.42138671875,
    latitude: -1.39640378952026,
    elevation: 1799,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-2',
    name: 'Escuela de Educación Básica Pedro Vicente Maldonado',
    longitude: -78.4235556624761,
    latitude: -1.40000903655777,
    elevation: 1806,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-3',
    name: 'Escuela de Vizcaya',
    longitude: -78.406537305344,
    latitude: -1.34856303933871,
    elevation: 2262,
    parroquia: 'Ulba / Vizcaya'
  },
  {
    id: 'inst-4',
    name: 'Escuela Fray Sebastian Acosta',
    longitude: -78.4229357740379,
    latitude: -1.39956954493433,
    elevation: 1810,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-5',
    name: 'Escuela Leonidas García - Río blanco',
    longitude: -78.3488307280052,
    latitude: -1.39856369768349,
    elevation: 1584,
    parroquia: 'Ulba / Río Blanco'
  },
  {
    id: 'inst-6',
    name: 'Escuela Río Negro',
    longitude: -78.2118594463316,
    latitude: -1.41321879789048,
    elevation: 1227,
    parroquia: 'Río Negro'
  },
  {
    id: 'inst-7',
    name: 'Unidad Educativa Baños',
    longitude: -78.4304222221257,
    latitude: -1.39722627645264,
    elevation: 1859,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-8',
    name: 'Unidad Educativa Baños (escuela, primaria)',
    longitude: -78.4265544428538,
    latitude: -1.39795233219237,
    elevation: 1828,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-9',
    name: 'Unidad Educativa Dr. Misael Acosta Solis',
    longitude: -78.4117205511439,
    latitude: -1.39268199544051,
    elevation: 1757,
    parroquia: 'Ulba'
  },
  {
    id: 'inst-10',
    name: 'Unidad Educativa Oscar Efrén Reyes',
    longitude: -78.4204711914062,
    latitude: -1.39765548706056,
    elevation: 1800,
    parroquia: 'Baños (Matriz)'
  },
  {
    id: 'inst-11',
    name: 'Unidad Educativa Palomino Flores',
    longitude: -78.3955329961753,
    latitude: -1.39543615412856,
    elevation: 1710,
    parroquia: 'Ulba / Agoyán'
  },
  {
    id: 'inst-12',
    name: 'Unidad Educativa Puerta del Dorado',
    longitude: -78.3003367383475,
    latitude: -1.40169589898274,
    elevation: 1502,
    parroquia: 'Río Verde'
  },
  {
    id: 'inst-13',
    name: 'Unidad Educativa San Pio X',
    longitude: -78.4230840915724,
    latitude: -1.399644125595,
    elevation: 1811,
    parroquia: 'Baños (Matriz)'
  }
];
