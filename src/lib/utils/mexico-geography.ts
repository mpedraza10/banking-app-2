/**
 * Datos geográficos de México
 * Estados, Municipios y Colonias para formularios de búsqueda y edición de clientes
 */

export interface Estado {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
  estadoId: string;
}

export interface Colonia {
  id: string;
  nombre: string;
  municipioId: string;
  codigoPostal: string;
}

// 32 Estados de México
export const ESTADOS_MEXICO: Estado[] = [
  { id: "01", nombre: "Aguascalientes" },
  { id: "02", nombre: "Baja California" },
  { id: "03", nombre: "Baja California Sur" },
  { id: "04", nombre: "Campeche" },
  { id: "05", nombre: "Coahuila" },
  { id: "06", nombre: "Colima" },
  { id: "07", nombre: "Chiapas" },
  { id: "08", nombre: "Chihuahua" },
  { id: "09", nombre: "Ciudad de México" },
  { id: "10", nombre: "Durango" },
  { id: "11", nombre: "Guanajuato" },
  { id: "12", nombre: "Guerrero" },
  { id: "13", nombre: "Hidalgo" },
  { id: "14", nombre: "Jalisco" },
  { id: "15", nombre: "Estado de México" },
  { id: "16", nombre: "Michoacán" },
  { id: "17", nombre: "Morelos" },
  { id: "18", nombre: "Nayarit" },
  { id: "19", nombre: "Nuevo León" },
  { id: "20", nombre: "Oaxaca" },
  { id: "21", nombre: "Puebla" },
  { id: "22", nombre: "Querétaro" },
  { id: "23", nombre: "Quintana Roo" },
  { id: "24", nombre: "San Luis Potosí" },
  { id: "25", nombre: "Sinaloa" },
  { id: "26", nombre: "Sonora" },
  { id: "27", nombre: "Tabasco" },
  { id: "28", nombre: "Tamaulipas" },
  { id: "29", nombre: "Tlaxcala" },
  { id: "30", nombre: "Veracruz" },
  { id: "31", nombre: "Yucatán" },
  { id: "32", nombre: "Zacatecas" },
];

// Municipios representativos por estado (para pruebas)
export const MUNICIPIOS_MEXICO: Municipio[] = [
  // Aguascalientes (01)
  { id: "0101", nombre: "Aguascalientes", estadoId: "01" },
  { id: "0102", nombre: "Asientos", estadoId: "01" },
  { id: "0103", nombre: "Calvillo", estadoId: "01" },
  { id: "0104", nombre: "Cosío", estadoId: "01" },
  { id: "0105", nombre: "Jesús María", estadoId: "01" },

  // Baja California (02)
  { id: "0201", nombre: "Ensenada", estadoId: "02" },
  { id: "0202", nombre: "Mexicali", estadoId: "02" },
  { id: "0203", nombre: "Tecate", estadoId: "02" },
  { id: "0204", nombre: "Tijuana", estadoId: "02" },
  { id: "0205", nombre: "Playas de Rosarito", estadoId: "02" },

  // Baja California Sur (03)
  { id: "0301", nombre: "Comondú", estadoId: "03" },
  { id: "0302", nombre: "Mulegé", estadoId: "03" },
  { id: "0303", nombre: "La Paz", estadoId: "03" },
  { id: "0304", nombre: "Los Cabos", estadoId: "03" },
  { id: "0305", nombre: "Loreto", estadoId: "03" },

  // Campeche (04)
  { id: "0401", nombre: "Calkiní", estadoId: "04" },
  { id: "0402", nombre: "Campeche", estadoId: "04" },
  { id: "0403", nombre: "Carmen", estadoId: "04" },
  { id: "0404", nombre: "Champotón", estadoId: "04" },
  { id: "0405", nombre: "Hecelchakán", estadoId: "04" },

  // Coahuila (05)
  { id: "0501", nombre: "Abasolo", estadoId: "05" },
  { id: "0502", nombre: "Acuña", estadoId: "05" },
  { id: "0503", nombre: "Monclova", estadoId: "05" },
  { id: "0504", nombre: "Piedras Negras", estadoId: "05" },
  { id: "0505", nombre: "Saltillo", estadoId: "05" },
  { id: "0506", nombre: "Torreón", estadoId: "05" },

  // Colima (06)
  { id: "0601", nombre: "Armería", estadoId: "06" },
  { id: "0602", nombre: "Colima", estadoId: "06" },
  { id: "0603", nombre: "Comala", estadoId: "06" },
  { id: "0604", nombre: "Manzanillo", estadoId: "06" },
  { id: "0605", nombre: "Tecomán", estadoId: "06" },

  // Chiapas (07)
  { id: "0701", nombre: "Tuxtla Gutiérrez", estadoId: "07" },
  { id: "0702", nombre: "San Cristóbal de las Casas", estadoId: "07" },
  { id: "0703", nombre: "Tapachula", estadoId: "07" },
  { id: "0704", nombre: "Comitán de Domínguez", estadoId: "07" },
  { id: "0705", nombre: "Chiapa de Corzo", estadoId: "07" },

  // Chihuahua (08)
  { id: "0801", nombre: "Chihuahua", estadoId: "08" },
  { id: "0802", nombre: "Ciudad Juárez", estadoId: "08" },
  { id: "0803", nombre: "Cuauhtémoc", estadoId: "08" },
  { id: "0804", nombre: "Delicias", estadoId: "08" },
  { id: "0805", nombre: "Parral", estadoId: "08" },

  // Ciudad de México (09)
  { id: "0901", nombre: "Álvaro Obregón", estadoId: "09" },
  { id: "0902", nombre: "Azcapotzalco", estadoId: "09" },
  { id: "0903", nombre: "Benito Juárez", estadoId: "09" },
  { id: "0904", nombre: "Coyoacán", estadoId: "09" },
  { id: "0905", nombre: "Cuajimalpa de Morelos", estadoId: "09" },
  { id: "0906", nombre: "Cuauhtémoc", estadoId: "09" },
  { id: "0907", nombre: "Gustavo A. Madero", estadoId: "09" },
  { id: "0908", nombre: "Iztacalco", estadoId: "09" },
  { id: "0909", nombre: "Iztapalapa", estadoId: "09" },
  { id: "0910", nombre: "Magdalena Contreras", estadoId: "09" },
  { id: "0911", nombre: "Miguel Hidalgo", estadoId: "09" },
  { id: "0912", nombre: "Milpa Alta", estadoId: "09" },
  { id: "0913", nombre: "Tláhuac", estadoId: "09" },
  { id: "0914", nombre: "Tlalpan", estadoId: "09" },
  { id: "0915", nombre: "Venustiano Carranza", estadoId: "09" },
  { id: "0916", nombre: "Xochimilco", estadoId: "09" },

  // Durango (10)
  { id: "1001", nombre: "Durango", estadoId: "10" },
  { id: "1002", nombre: "Gómez Palacio", estadoId: "10" },
  { id: "1003", nombre: "Lerdo", estadoId: "10" },
  { id: "1004", nombre: "Santiago Papasquiaro", estadoId: "10" },
  { id: "1005", nombre: "Canatlán", estadoId: "10" },

  // Guanajuato (11)
  { id: "1101", nombre: "Celaya", estadoId: "11" },
  { id: "1102", nombre: "Guanajuato", estadoId: "11" },
  { id: "1103", nombre: "Irapuato", estadoId: "11" },
  { id: "1104", nombre: "León", estadoId: "11" },
  { id: "1105", nombre: "Salamanca", estadoId: "11" },
  { id: "1106", nombre: "San Miguel de Allende", estadoId: "11" },

  // Guerrero (12)
  { id: "1201", nombre: "Acapulco de Juárez", estadoId: "12" },
  { id: "1202", nombre: "Chilpancingo de los Bravo", estadoId: "12" },
  { id: "1203", nombre: "Iguala de la Independencia", estadoId: "12" },
  { id: "1204", nombre: "Taxco de Alarcón", estadoId: "12" },
  { id: "1205", nombre: "Zihuatanejo de Azueta", estadoId: "12" },

  // Hidalgo (13)
  { id: "1301", nombre: "Pachuca de Soto", estadoId: "13" },
  { id: "1302", nombre: "Tulancingo de Bravo", estadoId: "13" },
  { id: "1303", nombre: "Tula de Allende", estadoId: "13" },
  { id: "1304", nombre: "Tepeji del Río de Ocampo", estadoId: "13" },
  { id: "1305", nombre: "Huejutla de Reyes", estadoId: "13" },

  // Jalisco (14)
  { id: "1401", nombre: "Guadalajara", estadoId: "14" },
  { id: "1402", nombre: "Zapopan", estadoId: "14" },
  { id: "1403", nombre: "Tlaquepaque", estadoId: "14" },
  { id: "1404", nombre: "Tonalá", estadoId: "14" },
  { id: "1405", nombre: "Tlajomulco de Zúñiga", estadoId: "14" },
  { id: "1406", nombre: "Puerto Vallarta", estadoId: "14" },
  { id: "1407", nombre: "Lagos de Moreno", estadoId: "14" },
  { id: "1408", nombre: "Tepatitlán de Morelos", estadoId: "14" },

  // Estado de México (15)
  { id: "1501", nombre: "Ecatepec de Morelos", estadoId: "15" },
  { id: "1502", nombre: "Nezahualcóyotl", estadoId: "15" },
  { id: "1503", nombre: "Naucalpan de Juárez", estadoId: "15" },
  { id: "1504", nombre: "Tlalnepantla de Baz", estadoId: "15" },
  { id: "1505", nombre: "Toluca", estadoId: "15" },
  { id: "1506", nombre: "Atizapán de Zaragoza", estadoId: "15" },
  { id: "1507", nombre: "Cuautitlán Izcalli", estadoId: "15" },
  { id: "1508", nombre: "Tultitlán", estadoId: "15" },
  { id: "1509", nombre: "Chimalhuacán", estadoId: "15" },
  { id: "1510", nombre: "Ixtapaluca", estadoId: "15" },

  // Michoacán (16)
  { id: "1601", nombre: "Morelia", estadoId: "16" },
  { id: "1602", nombre: "Uruapan", estadoId: "16" },
  { id: "1603", nombre: "Zamora", estadoId: "16" },
  { id: "1604", nombre: "Lázaro Cárdenas", estadoId: "16" },
  { id: "1605", nombre: "Pátzcuaro", estadoId: "16" },

  // Morelos (17)
  { id: "1701", nombre: "Cuernavaca", estadoId: "17" },
  { id: "1702", nombre: "Jiutepec", estadoId: "17" },
  { id: "1703", nombre: "Cuautla", estadoId: "17" },
  { id: "1704", nombre: "Temixco", estadoId: "17" },
  { id: "1705", nombre: "Yautepec", estadoId: "17" },

  // Nayarit (18)
  { id: "1801", nombre: "Tepic", estadoId: "18" },
  { id: "1802", nombre: "Bahía de Banderas", estadoId: "18" },
  { id: "1803", nombre: "Santiago Ixcuintla", estadoId: "18" },
  { id: "1804", nombre: "Compostela", estadoId: "18" },
  { id: "1805", nombre: "Xalisco", estadoId: "18" },

  // Nuevo León (19)
  { id: "1901", nombre: "Monterrey", estadoId: "19" },
  { id: "1902", nombre: "Guadalupe", estadoId: "19" },
  { id: "1903", nombre: "San Nicolás de los Garza", estadoId: "19" },
  { id: "1904", nombre: "Apodaca", estadoId: "19" },
  { id: "1905", nombre: "General Escobedo", estadoId: "19" },
  { id: "1906", nombre: "Santa Catarina", estadoId: "19" },
  { id: "1907", nombre: "San Pedro Garza García", estadoId: "19" },
  { id: "1908", nombre: "García", estadoId: "19" },

  // Oaxaca (20)
  { id: "2001", nombre: "Oaxaca de Juárez", estadoId: "20" },
  { id: "2002", nombre: "Santa Cruz Xoxocotlán", estadoId: "20" },
  { id: "2003", nombre: "San Juan Bautista Tuxtepec", estadoId: "20" },
  { id: "2004", nombre: "Salina Cruz", estadoId: "20" },
  { id: "2005", nombre: "Juchitán de Zaragoza", estadoId: "20" },

  // Puebla (21)
  { id: "2101", nombre: "Puebla", estadoId: "21" },
  { id: "2102", nombre: "Tehuacán", estadoId: "21" },
  { id: "2103", nombre: "San Martín Texmelucan", estadoId: "21" },
  { id: "2104", nombre: "Atlixco", estadoId: "21" },
  { id: "2105", nombre: "San Pedro Cholula", estadoId: "21" },
  { id: "2106", nombre: "San Andrés Cholula", estadoId: "21" },

  // Querétaro (22)
  { id: "2201", nombre: "Querétaro", estadoId: "22" },
  { id: "2202", nombre: "San Juan del Río", estadoId: "22" },
  { id: "2203", nombre: "Corregidora", estadoId: "22" },
  { id: "2204", nombre: "El Marqués", estadoId: "22" },
  { id: "2205", nombre: "Tequisquiapan", estadoId: "22" },

  // Quintana Roo (23)
  { id: "2301", nombre: "Benito Juárez (Cancún)", estadoId: "23" },
  { id: "2302", nombre: "Othón P. Blanco", estadoId: "23" },
  { id: "2303", nombre: "Solidaridad (Playa del Carmen)", estadoId: "23" },
  { id: "2304", nombre: "Cozumel", estadoId: "23" },
  { id: "2305", nombre: "Tulum", estadoId: "23" },

  // San Luis Potosí (24)
  { id: "2401", nombre: "San Luis Potosí", estadoId: "24" },
  { id: "2402", nombre: "Soledad de Graciano Sánchez", estadoId: "24" },
  { id: "2403", nombre: "Ciudad Valles", estadoId: "24" },
  { id: "2404", nombre: "Matehuala", estadoId: "24" },
  { id: "2405", nombre: "Rioverde", estadoId: "24" },

  // Sinaloa (25)
  { id: "2501", nombre: "Culiacán", estadoId: "25" },
  { id: "2502", nombre: "Mazatlán", estadoId: "25" },
  { id: "2503", nombre: "Los Mochis", estadoId: "25" },
  { id: "2504", nombre: "Guasave", estadoId: "25" },
  { id: "2505", nombre: "Navolato", estadoId: "25" },

  // Sonora (26)
  { id: "2601", nombre: "Hermosillo", estadoId: "26" },
  { id: "2602", nombre: "Ciudad Obregón", estadoId: "26" },
  { id: "2603", nombre: "Nogales", estadoId: "26" },
  { id: "2604", nombre: "San Luis Río Colorado", estadoId: "26" },
  { id: "2605", nombre: "Guaymas", estadoId: "26" },

  // Tabasco (27)
  { id: "2701", nombre: "Centro (Villahermosa)", estadoId: "27" },
  { id: "2702", nombre: "Cárdenas", estadoId: "27" },
  { id: "2703", nombre: "Comalcalco", estadoId: "27" },
  { id: "2704", nombre: "Macuspana", estadoId: "27" },
  { id: "2705", nombre: "Paraíso", estadoId: "27" },

  // Tamaulipas (28)
  { id: "2801", nombre: "Reynosa", estadoId: "28" },
  { id: "2802", nombre: "Matamoros", estadoId: "28" },
  { id: "2803", nombre: "Nuevo Laredo", estadoId: "28" },
  { id: "2804", nombre: "Ciudad Victoria", estadoId: "28" },
  { id: "2805", nombre: "Tampico", estadoId: "28" },
  { id: "2806", nombre: "Ciudad Madero", estadoId: "28" },

  // Tlaxcala (29)
  { id: "2901", nombre: "Tlaxcala", estadoId: "29" },
  { id: "2902", nombre: "Apizaco", estadoId: "29" },
  { id: "2903", nombre: "Huamantla", estadoId: "29" },
  { id: "2904", nombre: "San Pablo del Monte", estadoId: "29" },
  { id: "2905", nombre: "Chiautempan", estadoId: "29" },

  // Veracruz (30)
  { id: "3001", nombre: "Veracruz", estadoId: "30" },
  { id: "3002", nombre: "Xalapa", estadoId: "30" },
  { id: "3003", nombre: "Coatzacoalcos", estadoId: "30" },
  { id: "3004", nombre: "Córdoba", estadoId: "30" },
  { id: "3005", nombre: "Orizaba", estadoId: "30" },
  { id: "3006", nombre: "Boca del Río", estadoId: "30" },
  { id: "3007", nombre: "Poza Rica de Hidalgo", estadoId: "30" },

  // Yucatán (31)
  { id: "3101", nombre: "Mérida", estadoId: "31" },
  { id: "3102", nombre: "Kanasín", estadoId: "31" },
  { id: "3103", nombre: "Valladolid", estadoId: "31" },
  { id: "3104", nombre: "Umán", estadoId: "31" },
  { id: "3105", nombre: "Progreso", estadoId: "31" },

  // Zacatecas (32)
  { id: "3201", nombre: "Zacatecas", estadoId: "32" },
  { id: "3202", nombre: "Guadalupe", estadoId: "32" },
  { id: "3203", nombre: "Fresnillo", estadoId: "32" },
  { id: "3204", nombre: "Jerez", estadoId: "32" },
  { id: "3205", nombre: "Río Grande", estadoId: "32" },
];

// Colonias representativas (para pruebas - todos los municipios)
export const COLONIAS_MEXICO: Colonia[] = [
  // Aguascalientes (01)
  // Aguascalientes (0101)
  { id: "010101", nombre: "Centro", municipioId: "0101", codigoPostal: "20000" },
  { id: "010102", nombre: "Jardines de la Asunción", municipioId: "0101", codigoPostal: "20270" },
  { id: "010103", nombre: "Bosques del Prado Norte", municipioId: "0101", codigoPostal: "20127" },
  { id: "010104", nombre: "Fraccionamiento Constitución", municipioId: "0101", codigoPostal: "20059" },
  { id: "010105", nombre: "Villas de Nuestra Señora de la Asunción", municipioId: "0101", codigoPostal: "20126" },
  // Asientos (0102)
  { id: "010201", nombre: "Centro", municipioId: "0102", codigoPostal: "20710" },
  { id: "010202", nombre: "El Tule", municipioId: "0102", codigoPostal: "20712" },
  { id: "010203", nombre: "Pilotos", municipioId: "0102", codigoPostal: "20714" },
  // Calvillo (0103)
  { id: "010301", nombre: "Centro", municipioId: "0103", codigoPostal: "20800" },
  { id: "010302", nombre: "El Sauz", municipioId: "0103", codigoPostal: "20802" },
  { id: "010303", nombre: "Jaltiche de Arriba", municipioId: "0103", codigoPostal: "20815" },
  // Cosío (0104)
  { id: "010401", nombre: "Centro", municipioId: "0104", codigoPostal: "20470" },
  { id: "010402", nombre: "Tanque de los Jiménez", municipioId: "0104", codigoPostal: "20475" },
  // Jesús María (0105)
  { id: "010501", nombre: "Centro", municipioId: "0105", codigoPostal: "20920" },
  { id: "010502", nombre: "Tapias Viejas", municipioId: "0105", codigoPostal: "20926" },
  { id: "010503", nombre: "Fracc. Arroyo de la Presa", municipioId: "0105", codigoPostal: "20924" },

  // Baja California (02)
  // Ensenada (0201)
  { id: "020101", nombre: "Centro", municipioId: "0201", codigoPostal: "22800" },
  { id: "020102", nombre: "Bahía", municipioId: "0201", codigoPostal: "22880" },
  { id: "020103", nombre: "Chapultepec", municipioId: "0201", codigoPostal: "22785" },
  { id: "020104", nombre: "Valle Dorado", municipioId: "0201", codigoPostal: "22890" },
  { id: "020105", nombre: "Maneadero", municipioId: "0201", codigoPostal: "22790" },
  // Mexicali (0202)
  { id: "020201", nombre: "Centro", municipioId: "0202", codigoPostal: "21000" },
  { id: "020202", nombre: "Residencial California", municipioId: "0202", codigoPostal: "21040" },
  { id: "020203", nombre: "Pueblo Nuevo", municipioId: "0202", codigoPostal: "21120" },
  { id: "020204", nombre: "Industrial", municipioId: "0202", codigoPostal: "21010" },
  { id: "020205", nombre: "Ex-Ejido Coahuila", municipioId: "0202", codigoPostal: "21360" },
  // Tecate (0203)
  { id: "020301", nombre: "Centro", municipioId: "0203", codigoPostal: "21400" },
  { id: "020302", nombre: "Maclovio Herrera", municipioId: "0203", codigoPostal: "21450" },
  { id: "020303", nombre: "El Descanso", municipioId: "0203", codigoPostal: "21433" },
  // Tijuana (0204)
  { id: "020401", nombre: "Centro", municipioId: "0204", codigoPostal: "22000" },
  { id: "020402", nombre: "Zona Río", municipioId: "0204", codigoPostal: "22320" },
  { id: "020403", nombre: "Playas de Tijuana", municipioId: "0204", codigoPostal: "22500" },
  { id: "020404", nombre: "Hipódromo", municipioId: "0204", codigoPostal: "22020" },
  { id: "020405", nombre: "Otay Universidad", municipioId: "0204", codigoPostal: "22427" },
  // Playas de Rosarito (0205)
  { id: "020501", nombre: "Centro", municipioId: "0205", codigoPostal: "22710" },
  { id: "020502", nombre: "Rosarito Centro", municipioId: "0205", codigoPostal: "22700" },
  { id: "020503", nombre: "Popotla", municipioId: "0205", codigoPostal: "22749" },

  // Baja California Sur (03)
  // Comondú (0301)
  { id: "030101", nombre: "Centro", municipioId: "0301", codigoPostal: "23600" },
  { id: "030102", nombre: "Loreto", municipioId: "0301", codigoPostal: "23610" },
  { id: "030103", nombre: "Puerto San Carlos", municipioId: "0301", codigoPostal: "23740" },
  { id: "030104", nombre: "Villa Insurgentes", municipioId: "0301", codigoPostal: "23700" },
  { id: "030105", nombre: "Ciudad Constitución", municipioId: "0301", codigoPostal: "23600" },
  // Mulegé (0302)
  { id: "030201", nombre: "Centro", municipioId: "0302", codigoPostal: "23900" },
  { id: "030202", nombre: "Santa Rosalía Centro", municipioId: "0302", codigoPostal: "23920" },
  { id: "030203", nombre: "Guerrero Negro", municipioId: "0302", codigoPostal: "23940" },
  { id: "030204", nombre: "San Ignacio", municipioId: "0302", codigoPostal: "23930" },
  { id: "030205", nombre: "Bahía de los Ángeles", municipioId: "0302", codigoPostal: "23950" },
  // La Paz (0303)
  { id: "030301", nombre: "Centro", municipioId: "0303", codigoPostal: "23000" },
  { id: "030302", nombre: "El Centro", municipioId: "0303", codigoPostal: "23000" },
  { id: "030303", nombre: "Esterito", municipioId: "0303", codigoPostal: "23020" },
  { id: "030304", nombre: "8 de Octubre", municipioId: "0303", codigoPostal: "23060" },
  { id: "030305", nombre: "Fidepaz", municipioId: "0303", codigoPostal: "23094" },
  { id: "030306", nombre: "Paraíso del Sol", municipioId: "0303", codigoPostal: "23084" },
  // Los Cabos (0304)
  { id: "030401", nombre: "Centro San José", municipioId: "0304", codigoPostal: "23400" },
  { id: "030402", nombre: "Centro Cabo San Lucas", municipioId: "0304", codigoPostal: "23450" },
  { id: "030403", nombre: "El Medano", municipioId: "0304", codigoPostal: "23453" },
  { id: "030404", nombre: "Zona Hotelera", municipioId: "0304", codigoPostal: "23410" },
  { id: "030405", nombre: "Santa Rosa", municipioId: "0304", codigoPostal: "23400" },
  // Loreto (0305)
  { id: "030501", nombre: "Centro", municipioId: "0305", codigoPostal: "23880" },
  { id: "030502", nombre: "Centro Histórico", municipioId: "0305", codigoPostal: "23880" },
  { id: "030503", nombre: "Miramar", municipioId: "0305", codigoPostal: "23884" },
  { id: "030504", nombre: "Loreto Bay", municipioId: "0305", codigoPostal: "23888" },

  // Campeche (04)
  // Calkiní (0401)
  { id: "040101", nombre: "Centro", municipioId: "0401", codigoPostal: "24900" },
  { id: "040102", nombre: "Dzitbalché", municipioId: "0401", codigoPostal: "24935" },
  // Campeche (0402)
  { id: "040201", nombre: "Centro", municipioId: "0402", codigoPostal: "24000" },
  { id: "040202", nombre: "San Román", municipioId: "0402", codigoPostal: "24040" },
  { id: "040203", nombre: "Ah Kim Pech", municipioId: "0402", codigoPostal: "24014" },
  { id: "040204", nombre: "Santa Ana", municipioId: "0402", codigoPostal: "24050" },
  // Carmen (0403)
  { id: "040301", nombre: "Centro", municipioId: "0403", codigoPostal: "24100" },
  { id: "040302", nombre: "Renovación", municipioId: "0403", codigoPostal: "24150" },
  { id: "040303", nombre: "Manigua", municipioId: "0403", codigoPostal: "24115" },
  // Champotón (0404)
  { id: "040401", nombre: "Centro", municipioId: "0404", codigoPostal: "24400" },
  { id: "040402", nombre: "Las Flores", municipioId: "0404", codigoPostal: "24410" },
  // Hecelchakán (0405)
  { id: "040501", nombre: "Centro", municipioId: "0405", codigoPostal: "24800" },
  { id: "040502", nombre: "Pomuch", municipioId: "0405", codigoPostal: "24830" },

  // Coahuila (05)
  // Abasolo (0501)
  { id: "050101", nombre: "Centro", municipioId: "0501", codigoPostal: "27550" },
  // Acuña (0502)
  { id: "050201", nombre: "Centro", municipioId: "0502", codigoPostal: "26200" },
  { id: "050202", nombre: "Aviación", municipioId: "0502", codigoPostal: "26235" },
  { id: "050203", nombre: "Las Granjas", municipioId: "0502", codigoPostal: "26280" },
  // Monclova (0503)
  { id: "050301", nombre: "Centro", municipioId: "0503", codigoPostal: "25700" },
  { id: "050302", nombre: "Tecnológico", municipioId: "0503", codigoPostal: "25720" },
  { id: "050303", nombre: "Guadalupe", municipioId: "0503", codigoPostal: "25750" },
  // Piedras Negras (0504)
  { id: "050401", nombre: "Centro", municipioId: "0504", codigoPostal: "26000" },
  { id: "050402", nombre: "Roma", municipioId: "0504", codigoPostal: "26040" },
  { id: "050403", nombre: "Tecnológico", municipioId: "0504", codigoPostal: "26080" },
  // Saltillo (0505)
  { id: "050501", nombre: "Centro", municipioId: "0505", codigoPostal: "25000" },
  { id: "050502", nombre: "República", municipioId: "0505", codigoPostal: "25280" },
  { id: "050503", nombre: "Los Pinos", municipioId: "0505", codigoPostal: "25204" },
  { id: "050504", nombre: "Valle Real", municipioId: "0505", codigoPostal: "25209" },
  // Torreón (0506)
  { id: "050601", nombre: "Centro", municipioId: "0506", codigoPostal: "27000" },
  { id: "050602", nombre: "Torreón Jardín", municipioId: "0506", codigoPostal: "27200" },
  { id: "050603", nombre: "Residencial Campestre la Rosita", municipioId: "0506", codigoPostal: "27250" },
  { id: "050604", nombre: "San Isidro", municipioId: "0506", codigoPostal: "27100" },

  // Colima (06)
  // Armería (0601)
  { id: "060101", nombre: "Centro", municipioId: "0601", codigoPostal: "28300" },
  { id: "060102", nombre: "Cofradía de Juárez", municipioId: "0601", codigoPostal: "28310" },
  // Colima (0602)
  { id: "060201", nombre: "Centro", municipioId: "0602", codigoPostal: "28000" },
  { id: "060202", nombre: "Jardines Vista Hermosa", municipioId: "0602", codigoPostal: "28017" },
  { id: "060203", nombre: "Residencial Esmeralda", municipioId: "0602", codigoPostal: "28018" },
  // Comala (0603)
  { id: "060301", nombre: "Centro", municipioId: "0603", codigoPostal: "28450" },
  { id: "060302", nombre: "Suchitlán", municipioId: "0603", codigoPostal: "28460" },
  // Manzanillo (0604)
  { id: "060401", nombre: "Centro", municipioId: "0604", codigoPostal: "28200" },
  { id: "060402", nombre: "Santiago", municipioId: "0604", codigoPostal: "28860" },
  { id: "060403", nombre: "Salagua", municipioId: "0604", codigoPostal: "28869" },
  // Tecomán (0605)
  { id: "060501", nombre: "Centro", municipioId: "0605", codigoPostal: "28100" },
  { id: "060502", nombre: "Cerro de Ortega", municipioId: "0605", codigoPostal: "28930" },

  // Chiapas (07)
  // Tuxtla Gutiérrez (0701)
  { id: "070101", nombre: "Centro", municipioId: "0701", codigoPostal: "29000" },
  { id: "070102", nombre: "Las Granjas", municipioId: "0701", codigoPostal: "29019" },
  { id: "070103", nombre: "Infonavit Grijalva", municipioId: "0701", codigoPostal: "29050" },
  // San Cristóbal de las Casas (0702)
  { id: "070201", nombre: "Centro", municipioId: "0702", codigoPostal: "29200" },
  { id: "070202", nombre: "Barrio de Guadalupe", municipioId: "0702", codigoPostal: "29230" },
  { id: "070203", nombre: "La Merced", municipioId: "0702", codigoPostal: "29240" },
  // Tapachula (0703)
  { id: "070301", nombre: "Centro", municipioId: "0703", codigoPostal: "30700" },
  { id: "070302", nombre: "Las Vegas", municipioId: "0703", codigoPostal: "30740" },
  { id: "070303", nombre: "Jardín de la Peña", municipioId: "0703", codigoPostal: "30798" },
  // Comitán de Domínguez (0704)
  { id: "070401", nombre: "Centro", municipioId: "0704", codigoPostal: "30000" },
  { id: "070402", nombre: "Belisario Domínguez", municipioId: "0704", codigoPostal: "30039" },
  // Chiapa de Corzo (0705)
  { id: "070501", nombre: "Centro", municipioId: "0705", codigoPostal: "29160" },
  { id: "070502", nombre: "Ribera Cahuaré", municipioId: "0705", codigoPostal: "29167" },

  // Chihuahua (08)
  // Chihuahua (0801)
  { id: "080101", nombre: "Centro", municipioId: "0801", codigoPostal: "31000" },
  { id: "080102", nombre: "San Felipe", municipioId: "0801", codigoPostal: "31240" },
  { id: "080103", nombre: "Nombre de Dios", municipioId: "0801", codigoPostal: "31110" },
  { id: "080104", nombre: "Quintas del Sol", municipioId: "0801", codigoPostal: "31250" },
  // Ciudad Juárez (0802)
  { id: "080201", nombre: "Centro", municipioId: "0802", codigoPostal: "32000" },
  { id: "080202", nombre: "Pronaf", municipioId: "0802", codigoPostal: "32310" },
  { id: "080203", nombre: "Campestre", municipioId: "0802", codigoPostal: "32460" },
  { id: "080204", nombre: "Misión de los Lagos", municipioId: "0802", codigoPostal: "32689" },
  // Cuauhtémoc (0803)
  { id: "080301", nombre: "Centro", municipioId: "0803", codigoPostal: "31500" },
  { id: "080302", nombre: "Fovissste", municipioId: "0803", codigoPostal: "31530" },
  // Delicias (0804)
  { id: "080401", nombre: "Centro", municipioId: "0804", codigoPostal: "33000" },
  { id: "080402", nombre: "Industrial", municipioId: "0804", codigoPostal: "33130" },
  // Parral (0805)
  { id: "080501", nombre: "Centro", municipioId: "0805", codigoPostal: "33800" },
  { id: "080502", nombre: "Del Parque", municipioId: "0805", codigoPostal: "33850" },

  // Gustavo A. Madero - Ciudad de México (0907)
  { id: "090701", nombre: "Aragón", municipioId: "0907", codigoPostal: "07000" },
  { id: "090702", nombre: "Bondojito", municipioId: "0907", codigoPostal: "07850" },
  { id: "090703", nombre: "Cuautepec de Madero", municipioId: "0907", codigoPostal: "07100" },
  { id: "090704", nombre: "Guadalupe Tepeyac", municipioId: "0907", codigoPostal: "07840" },
  { id: "090705", nombre: "Industrial", municipioId: "0907", codigoPostal: "07800" },
  { id: "090706", nombre: "Jardines de Casa Blanca", municipioId: "0907", codigoPostal: "07180" },
  { id: "090707", nombre: "La Villa", municipioId: "0907", codigoPostal: "07050" },
  { id: "090708", nombre: "Lindavista", municipioId: "0907", codigoPostal: "07300" },
  { id: "090709", nombre: "Martín Carrera", municipioId: "0907", codigoPostal: "07070" },
  { id: "090710", nombre: "Nueva Atzacoalco", municipioId: "0907", codigoPostal: "07420" },
  { id: "090711", nombre: "San Felipe de Jesús", municipioId: "0907", codigoPostal: "07510" },
  { id: "090712", nombre: "San Juan de Aragón", municipioId: "0907", codigoPostal: "07950" },
  { id: "090713", nombre: "Villa de Guadalupe", municipioId: "0907", codigoPostal: "07010" },
  { id: "090714", nombre: "Zacatenco", municipioId: "0907", codigoPostal: "07360" },

  // Cuauhtémoc - Ciudad de México (0906)
  { id: "090601", nombre: "Centro Histórico", municipioId: "0906", codigoPostal: "06000" },
  { id: "090602", nombre: "Condesa", municipioId: "0906", codigoPostal: "06140" },
  { id: "090603", nombre: "Hipódromo", municipioId: "0906", codigoPostal: "06100" },
  { id: "090604", nombre: "Juárez", municipioId: "0906", codigoPostal: "06600" },
  { id: "090605", nombre: "Roma Norte", municipioId: "0906", codigoPostal: "06700" },
  { id: "090606", nombre: "Roma Sur", municipioId: "0906", codigoPostal: "06760" },
  { id: "090607", nombre: "San Rafael", municipioId: "0906", codigoPostal: "06470" },
  { id: "090608", nombre: "Santa María la Ribera", municipioId: "0906", codigoPostal: "06400" },
  { id: "090609", nombre: "Tabacalera", municipioId: "0906", codigoPostal: "06030" },
  { id: "090610", nombre: "Zona Rosa", municipioId: "0906", codigoPostal: "06600" },

  // Benito Juárez - Ciudad de México (0903)
  { id: "090301", nombre: "Del Valle Centro", municipioId: "0903", codigoPostal: "03100" },
  { id: "090302", nombre: "Del Valle Norte", municipioId: "0903", codigoPostal: "03103" },
  { id: "090303", nombre: "Del Valle Sur", municipioId: "0903", codigoPostal: "03104" },
  { id: "090304", nombre: "Narvarte Oriente", municipioId: "0903", codigoPostal: "03020" },
  { id: "090305", nombre: "Narvarte Poniente", municipioId: "0903", codigoPostal: "03000" },
  { id: "090306", nombre: "Nápoles", municipioId: "0903", codigoPostal: "03810" },
  { id: "090307", nombre: "Mixcoac", municipioId: "0903", codigoPostal: "03910" },
  { id: "090308", nombre: "San Pedro de los Pinos", municipioId: "0903", codigoPostal: "03800" },
  { id: "090309", nombre: "Xoco", municipioId: "0903", codigoPostal: "03330" },

  // Coyoacán - Ciudad de México (0904)
  { id: "090401", nombre: "Coyoacán Centro", municipioId: "0904", codigoPostal: "04000" },
  { id: "090402", nombre: "Del Carmen", municipioId: "0904", codigoPostal: "04100" },
  { id: "090403", nombre: "Ciudad Universitaria", municipioId: "0904", codigoPostal: "04510" },
  { id: "090404", nombre: "Copilco Universidad", municipioId: "0904", codigoPostal: "04360" },
  { id: "090405", nombre: "Pedregal de Santo Domingo", municipioId: "0904", codigoPostal: "04369" },
  { id: "090406", nombre: "Santa Úrsula Coapa", municipioId: "0904", codigoPostal: "04650" },

  // Miguel Hidalgo - Ciudad de México (0911)
  { id: "091101", nombre: "Polanco", municipioId: "0911", codigoPostal: "11550" },
  { id: "091102", nombre: "Anzures", municipioId: "0911", codigoPostal: "11590" },
  { id: "091103", nombre: "Chapultepec Morales", municipioId: "0911", codigoPostal: "11560" },
  { id: "091104", nombre: "Lomas de Chapultepec", municipioId: "0911", codigoPostal: "11000" },
  { id: "091105", nombre: "Tacuba", municipioId: "0911", codigoPostal: "11410" },
  { id: "091106", nombre: "Tacubaya", municipioId: "0911", codigoPostal: "11870" },
  { id: "091107", nombre: "Escandón", municipioId: "0911", codigoPostal: "11800" },

  // Iztapalapa - Ciudad de México (0909)
  { id: "090901", nombre: "Agrícola Oriental", municipioId: "0909", codigoPostal: "08500" },
  { id: "090902", nombre: "Santa Cruz Meyehualco", municipioId: "0909", codigoPostal: "09290" },
  { id: "090903", nombre: "Ejército de Oriente", municipioId: "0909", codigoPostal: "09230" },
  { id: "090904", nombre: "Ermita Iztapalapa", municipioId: "0909", codigoPostal: "09080" },
  { id: "090905", nombre: "San Lorenzo Tezonco", municipioId: "0909", codigoPostal: "09790" },

  // Álvaro Obregón - Ciudad de México (0901)
  { id: "090101", nombre: "San Ángel", municipioId: "0901", codigoPostal: "01000" },
  { id: "090102", nombre: "San Ángel Inn", municipioId: "0901", codigoPostal: "01060" },
  { id: "090103", nombre: "Florida", municipioId: "0901", codigoPostal: "01030" },
  { id: "090104", nombre: "Guadalupe Inn", municipioId: "0901", codigoPostal: "01020" },
  { id: "090105", nombre: "Tlacopac", municipioId: "0901", codigoPostal: "01040" },

  // Tlalpan - Ciudad de México (0914)
  { id: "091401", nombre: "Tlalpan Centro", municipioId: "0914", codigoPostal: "14000" },
  { id: "091402", nombre: "Pedregal de San Ángel", municipioId: "0914", codigoPostal: "04530" },
  { id: "091403", nombre: "Coapa", municipioId: "0914", codigoPostal: "14300" },
  { id: "091404", nombre: "Cumbres de Tepetongo", municipioId: "0914", codigoPostal: "14400" },

  // Azcapotzalco - Ciudad de México (0902)
  { id: "090201", nombre: "Azcapotzalco Centro", municipioId: "0902", codigoPostal: "02000" },
  { id: "090202", nombre: "Clavería", municipioId: "0902", codigoPostal: "02080" },
  { id: "090203", nombre: "Nueva Santa María", municipioId: "0902", codigoPostal: "02800" },
  { id: "090204", nombre: "Prados del Rosario", municipioId: "0902", codigoPostal: "02410" },

  // Cuajimalpa de Morelos - Ciudad de México (0905)
  { id: "090501", nombre: "Centro", municipioId: "0905", codigoPostal: "05000" },
  { id: "090502", nombre: "El Yaqui", municipioId: "0905", codigoPostal: "05320" },
  { id: "090503", nombre: "Jesús del Monte", municipioId: "0905", codigoPostal: "05260" },
  { id: "090504", nombre: "La Pila", municipioId: "0905", codigoPostal: "05350" },
  { id: "090505", nombre: "Lomas de Vista Hermosa", municipioId: "0905", codigoPostal: "05100" },
  { id: "090506", nombre: "Bosques de las Lomas", municipioId: "0905", codigoPostal: "05120" },

  // Iztacalco - Ciudad de México (0908)
  { id: "090801", nombre: "Agrícola Pantitlán", municipioId: "0908", codigoPostal: "08100" },
  { id: "090802", nombre: "Gabriel Ramos Millán", municipioId: "0908", codigoPostal: "08000" },
  { id: "090803", nombre: "Granjas México", municipioId: "0908", codigoPostal: "08400" },
  { id: "090804", nombre: "Militar Marte", municipioId: "0908", codigoPostal: "08830" },
  { id: "090805", nombre: "Pantitlán", municipioId: "0908", codigoPostal: "08100" },
  { id: "090806", nombre: "Viaducto Piedad", municipioId: "0908", codigoPostal: "08200" },

  // Magdalena Contreras - Ciudad de México (0910)
  { id: "091001", nombre: "Barranca Seca", municipioId: "0910", codigoPostal: "10580" },
  { id: "091002", nombre: "El Rosal", municipioId: "0910", codigoPostal: "10100" },
  { id: "091003", nombre: "La Magdalena", municipioId: "0910", codigoPostal: "10000" },
  { id: "091004", nombre: "Lomas Quebradas", municipioId: "0910", codigoPostal: "10200" },
  { id: "091005", nombre: "San Jerónimo Lídice", municipioId: "0910", codigoPostal: "10200" },

  // Milpa Alta - Ciudad de México (0912)
  { id: "091201", nombre: "Villa Milpa Alta", municipioId: "0912", codigoPostal: "12000" },
  { id: "091202", nombre: "San Antonio Tecómitl", municipioId: "0912", codigoPostal: "12100" },
  { id: "091203", nombre: "San Pedro Atocpan", municipioId: "0912", codigoPostal: "12200" },
  { id: "091204", nombre: "San Pablo Oztotepec", municipioId: "0912", codigoPostal: "12400" },
  { id: "091205", nombre: "San Francisco Tecoxpa", municipioId: "0912", codigoPostal: "12500" },

  // Tláhuac - Ciudad de México (0913)
  { id: "091301", nombre: "Del Mar", municipioId: "0913", codigoPostal: "13270" },
  { id: "091302", nombre: "La Estación", municipioId: "0913", codigoPostal: "13100" },
  { id: "091303", nombre: "Los Olivos", municipioId: "0913", codigoPostal: "13210" },
  { id: "091304", nombre: "San Francisco Tlaltenco", municipioId: "0913", codigoPostal: "13400" },
  { id: "091305", nombre: "Santa Catarina Yecahuizotl", municipioId: "0913", codigoPostal: "13100" },
  { id: "091306", nombre: "Zapotitla", municipioId: "0913", codigoPostal: "13310" },

  // Venustiano Carranza - Ciudad de México (0915)
  { id: "091501", nombre: "Aeronáutica Militar", municipioId: "0915", codigoPostal: "15970" },
  { id: "091502", nombre: "Balbuena", municipioId: "0915", codigoPostal: "15970" },
  { id: "091503", nombre: "Cuchilla Pantitlán", municipioId: "0915", codigoPostal: "15610" },
  { id: "091504", nombre: "Jardín Balbuena", municipioId: "0915", codigoPostal: "15900" },
  { id: "091505", nombre: "Moctezuma", municipioId: "0915", codigoPostal: "15500" },
  { id: "091506", nombre: "Morelos", municipioId: "0915", codigoPostal: "15270" },
  { id: "091507", nombre: "Romero Rubio", municipioId: "0915", codigoPostal: "15400" },

  // Xochimilco - Ciudad de México (0916)
  { id: "091601", nombre: "Barrio 18", municipioId: "0916", codigoPostal: "16030" },
  { id: "091602", nombre: "Centro de Xochimilco", municipioId: "0916", codigoPostal: "16000" },
  { id: "091603", nombre: "La Noria", municipioId: "0916", codigoPostal: "16030" },
  { id: "091604", nombre: "San Andrés Ahuayucan", municipioId: "0916", codigoPostal: "16100" },
  { id: "091605", nombre: "San Lorenzo Atemoaya", municipioId: "0916", codigoPostal: "16600" },
  { id: "091606", nombre: "Santa María Tepepan", municipioId: "0916", codigoPostal: "16020" },

  // Guadalajara, Jalisco (1401)
  { id: "140101", nombre: "Centro", municipioId: "1401", codigoPostal: "44100" },
  { id: "140102", nombre: "Americana", municipioId: "1401", codigoPostal: "44160" },
  { id: "140103", nombre: "Chapalita", municipioId: "1401", codigoPostal: "44500" },
  { id: "140104", nombre: "Jardines del Bosque", municipioId: "1401", codigoPostal: "44520" },
  { id: "140105", nombre: "Lafayette", municipioId: "1401", codigoPostal: "44150" },
  { id: "140106", nombre: "Providencia", municipioId: "1401", codigoPostal: "44630" },
  { id: "140107", nombre: "Santa Tere", municipioId: "1401", codigoPostal: "44600" },

  // Zapopan, Jalisco (1402)
  { id: "140201", nombre: "Ciudad del Sol", municipioId: "1402", codigoPostal: "45050" },
  { id: "140202", nombre: "Colinas de San Javier", municipioId: "1402", codigoPostal: "45110" },
  { id: "140203", nombre: "Puerta de Hierro", municipioId: "1402", codigoPostal: "45116" },
  { id: "140204", nombre: "Santa Margarita", municipioId: "1402", codigoPostal: "45130" },
  { id: "140205", nombre: "Valle Real", municipioId: "1402", codigoPostal: "45019" },

  // Tlaquepaque, Jalisco (1403)
  { id: "140301", nombre: "Centro", municipioId: "1403", codigoPostal: "45500" },
  { id: "140302", nombre: "Las Juntas", municipioId: "1403", codigoPostal: "45590" },
  { id: "140303", nombre: "Revolución", municipioId: "1403", codigoPostal: "45580" },
  { id: "140304", nombre: "Santa María Tequepexpan", municipioId: "1403", codigoPostal: "45601" },
  { id: "140305", nombre: "Tateposco", municipioId: "1403", codigoPostal: "45600" },

  // Tonalá, Jalisco (1404)
  { id: "140401", nombre: "Centro", municipioId: "1404", codigoPostal: "45400" },
  { id: "140402", nombre: "El Rosario", municipioId: "1404", codigoPostal: "45418" },
  { id: "140403", nombre: "Jalisco", municipioId: "1404", codigoPostal: "45425" },
  { id: "140404", nombre: "Lomas de Tonalá", municipioId: "1404", codigoPostal: "45408" },
  { id: "140405", nombre: "Puente Grande", municipioId: "1404", codigoPostal: "45420" },

  // Tlajomulco de Zúñiga, Jalisco (1405)
  { id: "140501", nombre: "Centro", municipioId: "1405", codigoPostal: "45640" },
  { id: "140502", nombre: "Hacienda Santa Fe", municipioId: "1405", codigoPostal: "45653" },
  { id: "140503", nombre: "La Tijera", municipioId: "1405", codigoPostal: "45645" },
  { id: "140504", nombre: "San Agustín", municipioId: "1405", codigoPostal: "45647" },
  { id: "140505", nombre: "Santa Cruz de las Flores", municipioId: "1405", codigoPostal: "45650" },

  // Puerto Vallarta, Jalisco (1406)
  { id: "140601", nombre: "Centro", municipioId: "1406", codigoPostal: "48300" },
  { id: "140602", nombre: "5 de Diciembre", municipioId: "1406", codigoPostal: "48350" },
  { id: "140603", nombre: "Emiliano Zapata", municipioId: "1406", codigoPostal: "48380" },
  { id: "140604", nombre: "Marina Vallarta", municipioId: "1406", codigoPostal: "48354" },
  { id: "140605", nombre: "Zona Romántica", municipioId: "1406", codigoPostal: "48380" },

  // Lagos de Moreno, Jalisco (1407)
  { id: "140701", nombre: "Centro", municipioId: "1407", codigoPostal: "47400" },
  { id: "140702", nombre: "El Refugio", municipioId: "1407", codigoPostal: "47420" },
  { id: "140703", nombre: "La Merced", municipioId: "1407", codigoPostal: "47410" },
  { id: "140704", nombre: "San Felipe", municipioId: "1407", codigoPostal: "47430" },

  // Tepatitlán de Morelos, Jalisco (1408)
  { id: "140801", nombre: "Centro", municipioId: "1408", codigoPostal: "47600" },
  { id: "140802", nombre: "Guadalupe", municipioId: "1408", codigoPostal: "47620" },
  { id: "140803", nombre: "La Purísima", municipioId: "1408", codigoPostal: "47618" },
  { id: "140804", nombre: "San José de Gracia", municipioId: "1408", codigoPostal: "47610" },

  // Monterrey, Nuevo León (1901)
  { id: "190101", nombre: "Centro", municipioId: "1901", codigoPostal: "64000" },
  { id: "190102", nombre: "Cumbres", municipioId: "1901", codigoPostal: "64610" },
  { id: "190103", nombre: "Del Valle", municipioId: "1901", codigoPostal: "66220" },
  { id: "190104", nombre: "Mitras Centro", municipioId: "1901", codigoPostal: "64460" },
  { id: "190105", nombre: "Obispado", municipioId: "1901", codigoPostal: "64060" },
  { id: "190106", nombre: "San Jerónimo", municipioId: "1901", codigoPostal: "64640" },
  { id: "190107", nombre: "Contry", municipioId: "1901", codigoPostal: "64860" },
  { id: "190108", nombre: "Vista Hermosa", municipioId: "1901", codigoPostal: "64620" },
  { id: "190109", nombre: "Tecnológico", municipioId: "1901", codigoPostal: "64700" },
  { id: "190110", nombre: "Chepevera", municipioId: "1901", codigoPostal: "64030" },

  // Guadalupe, Nuevo León (1902)
  { id: "190201", nombre: "Centro", municipioId: "1902", codigoPostal: "67100" },
  { id: "190202", nombre: "Linda Vista", municipioId: "1902", codigoPostal: "67130" },
  { id: "190203", nombre: "Valle de Santa Lucía", municipioId: "1902", codigoPostal: "67117" },
  { id: "190204", nombre: "Contry Sol", municipioId: "1902", codigoPostal: "67174" },
  { id: "190205", nombre: "Las Quintas", municipioId: "1902", codigoPostal: "67197" },
  { id: "190206", nombre: "Victoria", municipioId: "1902", codigoPostal: "67150" },

  // San Nicolás de los Garza, Nuevo León (1903)
  { id: "190301", nombre: "Centro", municipioId: "1903", codigoPostal: "66400" },
  { id: "190302", nombre: "Anáhuac", municipioId: "1903", codigoPostal: "66450" },
  { id: "190303", nombre: "Casa Bella", municipioId: "1903", codigoPostal: "66430" },
  { id: "190304", nombre: "Del Paseo Residencial", municipioId: "1903", codigoPostal: "66256" },
  { id: "190305", nombre: "Pedregal del Topo Chico", municipioId: "1903", codigoPostal: "66440" },
  { id: "190306", nombre: "Residencial Anáhuac", municipioId: "1903", codigoPostal: "66420" },

  // Apodaca, Nuevo León (1904)
  { id: "190401", nombre: "Centro", municipioId: "1904", codigoPostal: "66600" },
  { id: "190402", nombre: "Pueblo Nuevo", municipioId: "1904", codigoPostal: "66610" },
  { id: "190403", nombre: "Cosmópolis", municipioId: "1904", codigoPostal: "66612" },
  { id: "190404", nombre: "Cumbres de Santa Clara", municipioId: "1904", codigoPostal: "66635" },
  { id: "190405", nombre: "Huinalá", municipioId: "1904", codigoPostal: "66640" },
  { id: "190406", nombre: "Las Américas", municipioId: "1904", codigoPostal: "66614" },

  // General Escobedo, Nuevo León (1905)
  { id: "190501", nombre: "Centro", municipioId: "1905", codigoPostal: "66050" },
  { id: "190502", nombre: "Fomerrey 9", municipioId: "1905", codigoPostal: "66064" },
  { id: "190503", nombre: "Girasoles", municipioId: "1905", codigoPostal: "66055" },
  { id: "190504", nombre: "Los Altos", municipioId: "1905", codigoPostal: "66087" },
  { id: "190505", nombre: "Pedregal de Escobedo", municipioId: "1905", codigoPostal: "66062" },
  { id: "190506", nombre: "Valle de las Palmas", municipioId: "1905", codigoPostal: "66020" },

  // Santa Catarina, Nuevo León (1906)
  { id: "190601", nombre: "Centro", municipioId: "1906", codigoPostal: "66350" },
  { id: "190602", nombre: "Cumbres Provenza", municipioId: "1906", codigoPostal: "66365" },
  { id: "190603", nombre: "Infonavit La Huasteca", municipioId: "1906", codigoPostal: "66369" },
  { id: "190604", nombre: "Las Puentes", municipioId: "1906", codigoPostal: "66460" },
  { id: "190605", nombre: "Residencial Santa Catarina", municipioId: "1906", codigoPostal: "66358" },
  { id: "190606", nombre: "Valle de Santa María", municipioId: "1906", codigoPostal: "66367" },

  // San Pedro Garza García, Nuevo León (1907)
  { id: "190701", nombre: "Del Valle", municipioId: "1907", codigoPostal: "66220" },
  { id: "190702", nombre: "Fuentes del Valle", municipioId: "1907", codigoPostal: "66220" },
  { id: "190703", nombre: "San Agustín", municipioId: "1907", codigoPostal: "66260" },
  { id: "190704", nombre: "Valle de San Ángel", municipioId: "1907", codigoPostal: "66290" },
  { id: "190705", nombre: "Carrizalejo", municipioId: "1907", codigoPostal: "66254" },
  { id: "190706", nombre: "Hacienda San Agustín", municipioId: "1907", codigoPostal: "66269" },

  // García, Nuevo León (1908)
  { id: "190801", nombre: "Centro", municipioId: "1908", codigoPostal: "66000" },
  { id: "190802", nombre: "Cumbres del Sol", municipioId: "1908", codigoPostal: "66010" },
  { id: "190803", nombre: "Hacienda El Rosario", municipioId: "1908", codigoPostal: "66024" },
  { id: "190804", nombre: "Portal de las Salinas", municipioId: "1908", codigoPostal: "66001" },
  { id: "190805", nombre: "Villas de García", municipioId: "1908", codigoPostal: "66004" },
  { id: "190806", nombre: "Misión San José", municipioId: "1908", codigoPostal: "66003" },

  // Puebla, Puebla (2101)
  { id: "210101", nombre: "Centro Histórico", municipioId: "2101", codigoPostal: "72000" },
  { id: "210102", nombre: "Anzures", municipioId: "2101", codigoPostal: "72530" },
  { id: "210103", nombre: "La Paz", municipioId: "2101", codigoPostal: "72160" },
  { id: "210104", nombre: "Zavaleta", municipioId: "2101", codigoPostal: "72150" },
  { id: "210105", nombre: "Huexotitla", municipioId: "2101", codigoPostal: "72534" },

  // Ecatepec de Morelos, Estado de México (1501)
  { id: "150101", nombre: "Centro", municipioId: "1501", codigoPostal: "55000" },
  { id: "150102", nombre: "Jardines de Morelos", municipioId: "1501", codigoPostal: "55070" },
  { id: "150103", nombre: "Ciudad Azteca", municipioId: "1501", codigoPostal: "55120" },
  { id: "150104", nombre: "Valle de Aragón", municipioId: "1501", codigoPostal: "55280" },
  { id: "150105", nombre: "Las Américas", municipioId: "1501", codigoPostal: "55076" },

  // Nezahualcóyotl, Estado de México (1502)
  { id: "150201", nombre: "Centro", municipioId: "1502", codigoPostal: "57000" },
  { id: "150202", nombre: "Benito Juárez", municipioId: "1502", codigoPostal: "57000" },
  { id: "150203", nombre: "El Sol", municipioId: "1502", codigoPostal: "57200" },
  { id: "150204", nombre: "Impulsora Popular Avícola", municipioId: "1502", codigoPostal: "57130" },
  { id: "150205", nombre: "Metropolitana", municipioId: "1502", codigoPostal: "57740" },

  // Naucalpan de Juárez, Estado de México (1503)
  { id: "150301", nombre: "Centro", municipioId: "1503", codigoPostal: "53000" },
  { id: "150302", nombre: "Ciudad Satélite", municipioId: "1503", codigoPostal: "53100" },
  { id: "150303", nombre: "Echegaray", municipioId: "1503", codigoPostal: "53310" },
  { id: "150304", nombre: "Lomas Verdes", municipioId: "1503", codigoPostal: "53120" },
  { id: "150305", nombre: "Industrial Alce Blanco", municipioId: "1503", codigoPostal: "53370" },

  // Tlalnepantla de Baz, Estado de México (1504)
  { id: "150401", nombre: "Centro", municipioId: "1504", codigoPostal: "54000" },
  { id: "150402", nombre: "Industrial Vallejo", municipioId: "1504", codigoPostal: "54030" },
  { id: "150403", nombre: "San Andrés Atenco", municipioId: "1504", codigoPostal: "54040" },
  { id: "150404", nombre: "Viveros de la Loma", municipioId: "1504", codigoPostal: "54080" },
  { id: "150405", nombre: "La Presa", municipioId: "1504", codigoPostal: "54090" },

  // Toluca, Estado de México (1505)
  { id: "150501", nombre: "Centro", municipioId: "1505", codigoPostal: "50000" },
  { id: "150502", nombre: "Reforma", municipioId: "1505", codigoPostal: "50070" },
  { id: "150503", nombre: "Santa Ana Tlapaltitlán", municipioId: "1505", codigoPostal: "50160" },
  { id: "150504", nombre: "Universidad", municipioId: "1505", codigoPostal: "50130" },

  // Atizapán de Zaragoza, Estado de México (1506)
  { id: "150601", nombre: "Centro", municipioId: "1506", codigoPostal: "52900" },
  { id: "150602", nombre: "Condado de Sayavedra", municipioId: "1506", codigoPostal: "52938" },
  { id: "150603", nombre: "Las Alamedas", municipioId: "1506", codigoPostal: "52970" },
  { id: "150604", nombre: "Lomas de Atizapán", municipioId: "1506", codigoPostal: "52978" },
  { id: "150605", nombre: "Zona Esmeralda", municipioId: "1506", codigoPostal: "52930" },

  // Cuautitlán Izcalli, Estado de México (1507)
  { id: "150701", nombre: "Centro Urbano", municipioId: "1507", codigoPostal: "54700" },
  { id: "150702", nombre: "Arcos de la Hacienda", municipioId: "1507", codigoPostal: "54730" },
  { id: "150703", nombre: "La Cañada", municipioId: "1507", codigoPostal: "54910" },
  { id: "150704", nombre: "Las Américas", municipioId: "1507", codigoPostal: "54770" },
  { id: "150705", nombre: "Valle de las Flores", municipioId: "1507", codigoPostal: "54744" },

  // Tultitlán, Estado de México (1508)
  { id: "150801", nombre: "Centro", municipioId: "1508", codigoPostal: "54900" },
  { id: "150802", nombre: "Fuentes del Valle", municipioId: "1508", codigoPostal: "54910" },
  { id: "150803", nombre: "San Pablo de las Salinas", municipioId: "1508", codigoPostal: "54930" },
  { id: "150804", nombre: "Santa María", municipioId: "1508", codigoPostal: "54905" },
  { id: "150805", nombre: "Valle de Tules", municipioId: "1508", codigoPostal: "54914" },

  // Chimalhuacán, Estado de México (1509)
  { id: "150901", nombre: "Centro", municipioId: "1509", codigoPostal: "56330" },
  { id: "150902", nombre: "Acuitlapilco", municipioId: "1509", codigoPostal: "56334" },
  { id: "150903", nombre: "Fundidores", municipioId: "1509", codigoPostal: "56350" },
  { id: "150904", nombre: "San Agustín Atlapulco", municipioId: "1509", codigoPostal: "56363" },
  { id: "150905", nombre: "San Lorenzo", municipioId: "1509", codigoPostal: "56340" },

  // Ixtapaluca, Estado de México (1510)
  { id: "151001", nombre: "Centro", municipioId: "1510", codigoPostal: "56530" },
  { id: "151002", nombre: "San Buenaventura", municipioId: "1510", codigoPostal: "56536" },
  { id: "151003", nombre: "Santa Bárbara", municipioId: "1510", codigoPostal: "56535" },
  { id: "151004", nombre: "Valle de los Pinos", municipioId: "1510", codigoPostal: "56538" },
  { id: "151005", nombre: "Los Héroes", municipioId: "1510", codigoPostal: "56585" },

  // Querétaro, Querétaro (2201)
  { id: "220101", nombre: "Centro Histórico", municipioId: "2201", codigoPostal: "76000" },
  { id: "220102", nombre: "Juriquilla", municipioId: "2201", codigoPostal: "76226" },
  { id: "220103", nombre: "El Campanario", municipioId: "2201", codigoPostal: "76146" },
  { id: "220104", nombre: "Milenio III", municipioId: "2201", codigoPostal: "76060" },
  { id: "220105", nombre: "Zibatá", municipioId: "2201", codigoPostal: "76269" },

  // Mérida, Yucatán (3101)
  { id: "310101", nombre: "Centro", municipioId: "3101", codigoPostal: "97000" },
  { id: "310102", nombre: "Altabrisa", municipioId: "3101", codigoPostal: "97130" },
  { id: "310103", nombre: "Montebello", municipioId: "3101", codigoPostal: "97113" },
  { id: "310104", nombre: "García Ginerés", municipioId: "3101", codigoPostal: "97070" },
  { id: "310105", nombre: "Campestre", municipioId: "3101", codigoPostal: "97120" },

  // Cancún (Benito Juárez), Quintana Roo (2301)
  { id: "230101", nombre: "Centro", municipioId: "2301", codigoPostal: "77500" },
  { id: "230102", nombre: "Zona Hotelera", municipioId: "2301", codigoPostal: "77500" },
  { id: "230103", nombre: "Puerto Cancún", municipioId: "2301", codigoPostal: "77500" },
  { id: "230104", nombre: "Supermanzana 500", municipioId: "2301", codigoPostal: "77533" },

  // Othón P. Blanco, Quintana Roo (2302)
  { id: "230201", nombre: "Centro", municipioId: "2302", codigoPostal: "77000" },
  { id: "230202", nombre: "Barrio Bravo", municipioId: "2302", codigoPostal: "77098" },
  { id: "230203", nombre: "David Gustavo Gutiérrez Ruiz", municipioId: "2302", codigoPostal: "77086" },
  { id: "230204", nombre: "Del Bosque", municipioId: "2302", codigoPostal: "77019" },

  // Solidaridad (Playa del Carmen), Quintana Roo (2303)
  { id: "230301", nombre: "Centro", municipioId: "2303", codigoPostal: "77710" },
  { id: "230302", nombre: "Playacar", municipioId: "2303", codigoPostal: "77717" },
  { id: "230303", nombre: "Ejidal", municipioId: "2303", codigoPostal: "77712" },
  { id: "230304", nombre: "Playa Magna", municipioId: "2303", codigoPostal: "77726" },

  // Cozumel, Quintana Roo (2304)
  { id: "230401", nombre: "Centro", municipioId: "2304", codigoPostal: "77600" },
  { id: "230402", nombre: "10 de Abril", municipioId: "2304", codigoPostal: "77622" },
  { id: "230403", nombre: "Corpus Christi", municipioId: "2304", codigoPostal: "77664" },
  { id: "230404", nombre: "Flamingos", municipioId: "2304", codigoPostal: "77614" },

  // Tulum, Quintana Roo (2305)
  { id: "230501", nombre: "Centro", municipioId: "2305", codigoPostal: "77780" },
  { id: "230502", nombre: "Zona Arqueológica", municipioId: "2305", codigoPostal: "77780" },
  { id: "230503", nombre: "Aldea Zamá", municipioId: "2305", codigoPostal: "77760" },
  { id: "230504", nombre: "La Veleta", municipioId: "2305", codigoPostal: "77763" },

  // Durango (10)
  // Durango (1001)
  { id: "100101", nombre: "Centro", municipioId: "1001", codigoPostal: "34000" },
  { id: "100102", nombre: "Guadalupe", municipioId: "1001", codigoPostal: "34220" },
  { id: "100103", nombre: "Valle del Sur", municipioId: "1001", codigoPostal: "34166" },
  { id: "100104", nombre: "Jardines de Durango", municipioId: "1001", codigoPostal: "34200" },
  // Gómez Palacio (1002)
  { id: "100201", nombre: "Centro", municipioId: "1002", codigoPostal: "35000" },
  { id: "100202", nombre: "Campestre la Rosita", municipioId: "1002", codigoPostal: "35100" },
  { id: "100203", nombre: "Residencial del Norte", municipioId: "1002", codigoPostal: "35086" },
  // Lerdo (1003)
  { id: "100301", nombre: "Centro", municipioId: "1003", codigoPostal: "35150" },
  { id: "100302", nombre: "Residencial las Torres", municipioId: "1003", codigoPostal: "35176" },
  // Santiago Papasquiaro (1004)
  { id: "100401", nombre: "Centro", municipioId: "1004", codigoPostal: "34600" },
  { id: "100402", nombre: "El Progreso", municipioId: "1004", codigoPostal: "34606" },
  // Canatlán (1005)
  { id: "100501", nombre: "Centro", municipioId: "1005", codigoPostal: "34450" },
  { id: "100502", nombre: "La Soledad", municipioId: "1005", codigoPostal: "34455" },

  // Guanajuato (11)
  // Celaya (1101)
  { id: "110101", nombre: "Centro", municipioId: "1101", codigoPostal: "38000" },
  { id: "110102", nombre: "Valle Hermoso", municipioId: "1101", codigoPostal: "38010" },
  { id: "110103", nombre: "Residencial Tecnológico", municipioId: "1101", codigoPostal: "38010" },
  { id: "110104", nombre: "Del Parque", municipioId: "1101", codigoPostal: "38020" },
  // Guanajuato (1102)
  { id: "110201", nombre: "Centro", municipioId: "1102", codigoPostal: "36000" },
  { id: "110202", nombre: "Valenciana", municipioId: "1102", codigoPostal: "36240" },
  { id: "110203", nombre: "Marfil", municipioId: "1102", codigoPostal: "36250" },
  // Irapuato (1103)
  { id: "110301", nombre: "Centro", municipioId: "1103", codigoPostal: "36500" },
  { id: "110302", nombre: "Villas de Irapuato", municipioId: "1103", codigoPostal: "36670" },
  { id: "110303", nombre: "San Cayetano", municipioId: "1103", codigoPostal: "36540" },
  // León (1104)
  { id: "110401", nombre: "Centro", municipioId: "1104", codigoPostal: "37000" },
  { id: "110402", nombre: "Jardines del Moral", municipioId: "1104", codigoPostal: "37160" },
  { id: "110403", nombre: "La Martinica", municipioId: "1104", codigoPostal: "37500" },
  { id: "110404", nombre: "El Coecillo", municipioId: "1104", codigoPostal: "37260" },
  // Salamanca (1105)
  { id: "110501", nombre: "Centro", municipioId: "1105", codigoPostal: "36700" },
  { id: "110502", nombre: "Bellavista", municipioId: "1105", codigoPostal: "36730" },
  { id: "110503", nombre: "Valle de San Miguel", municipioId: "1105", codigoPostal: "36740" },
  // San Miguel de Allende (1106)
  { id: "110601", nombre: "Centro", municipioId: "1106", codigoPostal: "37700" },
  { id: "110602", nombre: "Atascadero", municipioId: "1106", codigoPostal: "37760" },
  { id: "110603", nombre: "San Antonio", municipioId: "1106", codigoPostal: "37750" },

  // Guerrero (12)
  // Acapulco de Juárez (1201)
  { id: "120101", nombre: "Centro", municipioId: "1201", codigoPostal: "39300" },
  { id: "120102", nombre: "Costa Azul", municipioId: "1201", codigoPostal: "39850" },
  { id: "120103", nombre: "Fracc. Club Deportivo", municipioId: "1201", codigoPostal: "39690" },
  { id: "120104", nombre: "Hornos Insurgentes", municipioId: "1201", codigoPostal: "39573" },
  // Chilpancingo de los Bravo (1202)
  { id: "120201", nombre: "Centro", municipioId: "1202", codigoPostal: "39000" },
  { id: "120202", nombre: "Burócratas", municipioId: "1202", codigoPostal: "39090" },
  { id: "120203", nombre: "Jardín", municipioId: "1202", codigoPostal: "39020" },
  // Iguala de la Independencia (1203)
  { id: "120301", nombre: "Centro", municipioId: "1203", codigoPostal: "40000" },
  { id: "120302", nombre: "Tamarindo", municipioId: "1203", codigoPostal: "40050" },
  // Taxco de Alarcón (1204)
  { id: "120401", nombre: "Centro", municipioId: "1204", codigoPostal: "40200" },
  { id: "120402", nombre: "Barrio de Arroyo", municipioId: "1204", codigoPostal: "40260" },
  // Zihuatanejo de Azueta (1205)
  { id: "120501", nombre: "Centro", municipioId: "1205", codigoPostal: "40880" },
  { id: "120502", nombre: "La Ropa", municipioId: "1205", codigoPostal: "40895" },
  { id: "120503", nombre: "Ixtapa", municipioId: "1205", codigoPostal: "40884" },

  // Hidalgo (13)
  // Pachuca de Soto (1301)
  { id: "130101", nombre: "Centro", municipioId: "1301", codigoPostal: "42000" },
  { id: "130102", nombre: "Periodistas", municipioId: "1301", codigoPostal: "42060" },
  { id: "130103", nombre: "Villas de Pachuca", municipioId: "1301", codigoPostal: "42083" },
  { id: "130104", nombre: "Real de Minas", municipioId: "1301", codigoPostal: "42090" },
  // Tulancingo de Bravo (1302)
  { id: "130201", nombre: "Centro", municipioId: "1302", codigoPostal: "43600" },
  { id: "130202", nombre: "La Morena", municipioId: "1302", codigoPostal: "43626" },
  { id: "130203", nombre: "San Antonio", municipioId: "1302", codigoPostal: "43620" },
  // Tula de Allende (1303)
  { id: "130301", nombre: "Centro", municipioId: "1303", codigoPostal: "42800" },
  { id: "130302", nombre: "El Salitre", municipioId: "1303", codigoPostal: "42830" },
  // Tepeji del Río de Ocampo (1304)
  { id: "130401", nombre: "Centro", municipioId: "1304", codigoPostal: "42850" },
  { id: "130402", nombre: "Tlaxinacalpan", municipioId: "1304", codigoPostal: "42865" },
  // Huejutla de Reyes (1305)
  { id: "130501", nombre: "Centro", municipioId: "1305", codigoPostal: "43000" },
  { id: "130502", nombre: "Tehuetlán", municipioId: "1305", codigoPostal: "43040" },

  // Michoacán (16)
  // Morelia (1601)
  { id: "160101", nombre: "Centro", municipioId: "1601", codigoPostal: "58000" },
  { id: "160102", nombre: "Chapultepec Norte", municipioId: "1601", codigoPostal: "58260" },
  { id: "160103", nombre: "Félix Ireta", municipioId: "1601", codigoPostal: "58070" },
  { id: "160104", nombre: "Tres Puentes", municipioId: "1601", codigoPostal: "58200" },
  // Uruapan (1602)
  { id: "160201", nombre: "Centro", municipioId: "1602", codigoPostal: "60000" },
  { id: "160202", nombre: "La Magdalena", municipioId: "1602", codigoPostal: "60050" },
  { id: "160203", nombre: "Ramón Farías", municipioId: "1602", codigoPostal: "60180" },
  // Zamora (1603)
  { id: "160301", nombre: "Centro", municipioId: "1603", codigoPostal: "59600" },
  { id: "160302", nombre: "Jardines de Catedral", municipioId: "1603", codigoPostal: "59610" },
  // Lázaro Cárdenas (1604)
  { id: "160401", nombre: "Centro", municipioId: "1604", codigoPostal: "60950" },
  { id: "160402", nombre: "Guacamayas", municipioId: "1604", codigoPostal: "60954" },
  // Pátzcuaro (1605)
  { id: "160501", nombre: "Centro", municipioId: "1605", codigoPostal: "61600" },
  { id: "160502", nombre: "San Juan de Dios", municipioId: "1605", codigoPostal: "61609" },

  // Morelos (17)
  // Cuernavaca (1701)
  { id: "170101", nombre: "Centro", municipioId: "1701", codigoPostal: "62000" },
  { id: "170102", nombre: "Chapultepec", municipioId: "1701", codigoPostal: "62450" },
  { id: "170103", nombre: "Lomas de Cuernavaca", municipioId: "1701", codigoPostal: "62584" },
  { id: "170104", nombre: "Vista Hermosa", municipioId: "1701", codigoPostal: "62290" },
  // Jiutepec (1702)
  { id: "170201", nombre: "Centro", municipioId: "1702", codigoPostal: "62550" },
  { id: "170202", nombre: "Progreso", municipioId: "1702", codigoPostal: "62574" },
  { id: "170203", nombre: "Tejalpa", municipioId: "1702", codigoPostal: "62570" },
  // Cuautla (1703)
  { id: "170301", nombre: "Centro", municipioId: "1703", codigoPostal: "62740" },
  { id: "170302", nombre: "Casasano", municipioId: "1703", codigoPostal: "62748" },
  { id: "170303", nombre: "Narciso Mendoza", municipioId: "1703", codigoPostal: "62757" },
  // Temixco (1704)
  { id: "170401", nombre: "Centro", municipioId: "1704", codigoPostal: "62580" },
  { id: "170402", nombre: "Acatlipa", municipioId: "1704", codigoPostal: "62584" },
  // Yautepec (1705)
  { id: "170501", nombre: "Centro", municipioId: "1705", codigoPostal: "62730" },
  { id: "170502", nombre: "Cocoyoc", municipioId: "1705", codigoPostal: "62738" },

  // Nayarit (18)
  // Tepic (1801)
  { id: "180101", nombre: "Centro", municipioId: "1801", codigoPostal: "63000" },
  { id: "180102", nombre: "Ciudad del Valle", municipioId: "1801", codigoPostal: "63157" },
  { id: "180103", nombre: "San Juan", municipioId: "1801", codigoPostal: "63130" },
  // Bahía de Banderas (1802)
  { id: "180201", nombre: "Centro", municipioId: "1802", codigoPostal: "63732" },
  { id: "180202", nombre: "Nuevo Vallarta", municipioId: "1802", codigoPostal: "63735" },
  { id: "180203", nombre: "Bucerías", municipioId: "1802", codigoPostal: "63732" },
  // Santiago Ixcuintla (1803)
  { id: "180301", nombre: "Centro", municipioId: "1803", codigoPostal: "63300" },
  { id: "180302", nombre: "Sentispac", municipioId: "1803", codigoPostal: "63350" },
  // Compostela (1804)
  { id: "180401", nombre: "Centro", municipioId: "1804", codigoPostal: "63700" },
  { id: "180402", nombre: "Las Varas", municipioId: "1804", codigoPostal: "63715" },
  // Xalisco (1805)
  { id: "180501", nombre: "Centro", municipioId: "1805", codigoPostal: "63780" },
  { id: "180502", nombre: "Nuevo Xalisco", municipioId: "1805", codigoPostal: "63783" },

  // Oaxaca (20)
  // Oaxaca de Juárez (2001)
  { id: "200101", nombre: "Centro", municipioId: "2001", codigoPostal: "68000" },
  { id: "200102", nombre: "Reforma", municipioId: "2001", codigoPostal: "68050" },
  { id: "200103", nombre: "Xochimilco", municipioId: "2001", codigoPostal: "68040" },
  // Santa Cruz Xoxocotlán (2002)
  { id: "200201", nombre: "Centro", municipioId: "2002", codigoPostal: "71230" },
  { id: "200202", nombre: "Dolores", municipioId: "2002", codigoPostal: "71233" },
  // San Juan Bautista Tuxtepec (2003)
  { id: "200301", nombre: "Centro", municipioId: "2003", codigoPostal: "68300" },
  { id: "200302", nombre: "El Castillo", municipioId: "2003", codigoPostal: "68330" },
  // Salina Cruz (2004)
  { id: "200401", nombre: "Centro", municipioId: "2004", codigoPostal: "70600" },
  { id: "200402", nombre: "Miramar", municipioId: "2004", codigoPostal: "70680" },
  // Juchitán de Zaragoza (2005)
  { id: "200501", nombre: "Centro", municipioId: "2005", codigoPostal: "70000" },
  { id: "200502", nombre: "Cheguigo", municipioId: "2005", codigoPostal: "70020" },

  // Puebla (21) - adicionales a los existentes
  // Tehuacán (2102)
  { id: "210201", nombre: "Centro", municipioId: "2102", codigoPostal: "75700" },
  { id: "210202", nombre: "Granjas de Tehuacán", municipioId: "2102", codigoPostal: "75855" },
  { id: "210203", nombre: "San Nicolás", municipioId: "2102", codigoPostal: "75750" },
  // San Martín Texmelucan (2103)
  { id: "210301", nombre: "Centro", municipioId: "2103", codigoPostal: "74000" },
  { id: "210302", nombre: "San Baltazar Temaxcalac", municipioId: "2103", codigoPostal: "74030" },
  // Atlixco (2104)
  { id: "210401", nombre: "Centro", municipioId: "2104", codigoPostal: "74200" },
  { id: "210402", nombre: "San Pedro Benito Juárez", municipioId: "2104", codigoPostal: "74269" },
  // San Pedro Cholula (2105)
  { id: "210501", nombre: "Centro", municipioId: "2105", codigoPostal: "72760" },
  { id: "210502", nombre: "San Andrés Cholula", municipioId: "2105", codigoPostal: "72810" },
  // San Andrés Cholula (2106)
  { id: "210601", nombre: "Centro", municipioId: "2106", codigoPostal: "72810" },
  { id: "210602", nombre: "Lomas de Angelópolis", municipioId: "2106", codigoPostal: "72830" },

  // Querétaro (22) - adicionales
  // San Juan del Río (2202)
  { id: "220201", nombre: "Centro", municipioId: "2202", codigoPostal: "76800" },
  { id: "220202", nombre: "Granjas Banthí", municipioId: "2202", codigoPostal: "76806" },
  // Corregidora (2203)
  { id: "220301", nombre: "Centro", municipioId: "2203", codigoPostal: "76900" },
  { id: "220302", nombre: "El Pueblito", municipioId: "2203", codigoPostal: "76900" },
  // El Marqués (2204)
  { id: "220401", nombre: "Centro", municipioId: "2204", codigoPostal: "76240" },
  { id: "220402", nombre: "La Pradera", municipioId: "2204", codigoPostal: "76248" },
  // Tequisquiapan (2205)
  { id: "220501", nombre: "Centro", municipioId: "2205", codigoPostal: "76750" },
  { id: "220502", nombre: "El Magueyal", municipioId: "2205", codigoPostal: "76759" },

  // San Luis Potosí (24)
  // San Luis Potosí (2401)
  { id: "240101", nombre: "Centro", municipioId: "2401", codigoPostal: "78000" },
  { id: "240102", nombre: "Industrial Aviación", municipioId: "2401", codigoPostal: "78140" },
  { id: "240103", nombre: "Lomas", municipioId: "2401", codigoPostal: "78210" },
  { id: "240104", nombre: "Tangamanga", municipioId: "2401", codigoPostal: "78269" },
  // Soledad de Graciano Sánchez (2402)
  { id: "240201", nombre: "Centro", municipioId: "2402", codigoPostal: "78430" },
  { id: "240202", nombre: "Rancho Pavón", municipioId: "2402", codigoPostal: "78437" },
  // Ciudad Valles (2403)
  { id: "240301", nombre: "Centro", municipioId: "2403", codigoPostal: "79000" },
  { id: "240302", nombre: "Framboyanes", municipioId: "2403", codigoPostal: "79050" },
  // Matehuala (2404)
  { id: "240401", nombre: "Centro", municipioId: "2404", codigoPostal: "78700" },
  { id: "240402", nombre: "Guadalupe", municipioId: "2404", codigoPostal: "78730" },
  // Rioverde (2405)
  { id: "240501", nombre: "Centro", municipioId: "2405", codigoPostal: "79610" },
  { id: "240502", nombre: "El Jabalí", municipioId: "2405", codigoPostal: "79620" },

  // Sinaloa (25)
  // Culiacán (2501)
  { id: "250101", nombre: "Centro", municipioId: "2501", codigoPostal: "80000" },
  { id: "250102", nombre: "Las Quintas", municipioId: "2501", codigoPostal: "80060" },
  { id: "250103", nombre: "Chapultepec", municipioId: "2501", codigoPostal: "80040" },
  // Mazatlán (2502)
  { id: "250201", nombre: "Centro", municipioId: "2502", codigoPostal: "82000" },
  { id: "250202", nombre: "Zona Dorada", municipioId: "2502", codigoPostal: "82110" },
  { id: "250203", nombre: "Marina Mazatlán", municipioId: "2502", codigoPostal: "82103" },
  // Los Mochis (2503)
  { id: "250301", nombre: "Centro", municipioId: "2503", codigoPostal: "81200" },
  { id: "250302", nombre: "Jiquilpan", municipioId: "2503", codigoPostal: "81220" },
  // Guasave (2504)
  { id: "250401", nombre: "Centro", municipioId: "2504", codigoPostal: "81000" },
  { id: "250402", nombre: "Ejidal", municipioId: "2504", codigoPostal: "81020" },
  // Navolato (2505)
  { id: "250501", nombre: "Centro", municipioId: "2505", codigoPostal: "80370" },
  { id: "250502", nombre: "Altata", municipioId: "2505", codigoPostal: "80540" },

  // Sonora (26)
  // Hermosillo (2601)
  { id: "260101", nombre: "Centro", municipioId: "2601", codigoPostal: "83000" },
  { id: "260102", nombre: "Las Quintas", municipioId: "2601", codigoPostal: "83240" },
  { id: "260103", nombre: "Pitic", municipioId: "2601", codigoPostal: "83150" },
  // Ciudad Obregón (2602)
  { id: "260201", nombre: "Centro", municipioId: "2602", codigoPostal: "85000" },
  { id: "260202", nombre: "Fovissste", municipioId: "2602", codigoPostal: "85090" },
  // Nogales (2603)
  { id: "260301", nombre: "Centro", municipioId: "2603", codigoPostal: "84000" },
  { id: "260302", nombre: "Fundo Legal", municipioId: "2603", codigoPostal: "84020" },
  // San Luis Río Colorado (2604)
  { id: "260401", nombre: "Centro", municipioId: "2604", codigoPostal: "83400" },
  { id: "260402", nombre: "Comercial", municipioId: "2604", codigoPostal: "83449" },
  // Guaymas (2605)
  { id: "260501", nombre: "Centro", municipioId: "2605", codigoPostal: "85400" },
  { id: "260502", nombre: "San Carlos", municipioId: "2605", codigoPostal: "85506" },

  // Tabasco (27)
  // Centro (Villahermosa) (2701)
  { id: "270101", nombre: "Centro", municipioId: "2701", codigoPostal: "86000" },
  { id: "270102", nombre: "Tamulté", municipioId: "2701", codigoPostal: "86150" },
  { id: "270103", nombre: "Tabasco 2000", municipioId: "2701", codigoPostal: "86035" },
  // Cárdenas (2702)
  { id: "270201", nombre: "Centro", municipioId: "2702", codigoPostal: "86500" },
  { id: "270202", nombre: "Paso del Toro", municipioId: "2702", codigoPostal: "86570" },
  // Comalcalco (2703)
  { id: "270301", nombre: "Centro", municipioId: "2703", codigoPostal: "86300" },
  { id: "270302", nombre: "Tecolutilla", municipioId: "2703", codigoPostal: "86330" },
  // Macuspana (2704)
  { id: "270401", nombre: "Centro", municipioId: "2704", codigoPostal: "86700" },
  { id: "270402", nombre: "Aquiles Serdán", municipioId: "2704", codigoPostal: "86730" },
  // Paraíso (2705)
  { id: "270501", nombre: "Centro", municipioId: "2705", codigoPostal: "86600" },
  { id: "270502", nombre: "Puerto Ceiba", municipioId: "2705", codigoPostal: "86608" },

  // Tamaulipas (28)
  // Reynosa (2801)
  { id: "280101", nombre: "Centro", municipioId: "2801", codigoPostal: "88500" },
  { id: "280102", nombre: "Del Valle", municipioId: "2801", codigoPostal: "88610" },
  { id: "280103", nombre: "Longoria", municipioId: "2801", codigoPostal: "88660" },
  // Matamoros (2802)
  { id: "280201", nombre: "Centro", municipioId: "2802", codigoPostal: "87300" },
  { id: "280202", nombre: "Jardín", municipioId: "2802", codigoPostal: "87330" },
  // Nuevo Laredo (2803)
  { id: "280301", nombre: "Centro", municipioId: "2803", codigoPostal: "88000" },
  { id: "280302", nombre: "Las Alazanas", municipioId: "2803", codigoPostal: "88240" },
  // Ciudad Victoria (2804)
  { id: "280401", nombre: "Centro", municipioId: "2804", codigoPostal: "87000" },
  { id: "280402", nombre: "Sierra Vista", municipioId: "2804", codigoPostal: "87028" },
  // Tampico (2805)
  { id: "280501", nombre: "Centro", municipioId: "2805", codigoPostal: "89000" },
  { id: "280502", nombre: "Altavista", municipioId: "2805", codigoPostal: "89230" },
  // Ciudad Madero (2806)
  { id: "280601", nombre: "Centro", municipioId: "2806", codigoPostal: "89400" },
  { id: "280602", nombre: "Arenal", municipioId: "2806", codigoPostal: "89440" },

  // Tlaxcala (29)
  // Tlaxcala (2901)
  { id: "290101", nombre: "Centro", municipioId: "2901", codigoPostal: "90000" },
  { id: "290102", nombre: "Ocotlán", municipioId: "2901", codigoPostal: "90100" },
  // Apizaco (2902)
  { id: "290201", nombre: "Centro", municipioId: "2902", codigoPostal: "90300" },
  { id: "290202", nombre: "El Carmen", municipioId: "2902", codigoPostal: "90340" },
  // Huamantla (2903)
  { id: "290301", nombre: "Centro", municipioId: "2903", codigoPostal: "90500" },
  { id: "290302", nombre: "San Lucas", municipioId: "2903", codigoPostal: "90540" },
  // San Pablo del Monte (2904)
  { id: "290401", nombre: "Centro", municipioId: "2904", codigoPostal: "90920" },
  { id: "290402", nombre: "La Santísima", municipioId: "2904", codigoPostal: "90934" },
  // Chiautempan (2905)
  { id: "290501", nombre: "Centro", municipioId: "2905", codigoPostal: "90800" },
  { id: "290502", nombre: "San Pedro", municipioId: "2905", codigoPostal: "90804" },

  // Veracruz (30)
  // Veracruz (3001)
  { id: "300101", nombre: "Centro", municipioId: "3001", codigoPostal: "91700" },
  { id: "300102", nombre: "Boca del Río", municipioId: "3001", codigoPostal: "94290" },
  { id: "300103", nombre: "Costa Verde", municipioId: "3001", codigoPostal: "94294" },
  // Xalapa (3002)
  { id: "300201", nombre: "Centro", municipioId: "3002", codigoPostal: "91000" },
  { id: "300202", nombre: "Ánimas", municipioId: "3002", codigoPostal: "91190" },
  { id: "300203", nombre: "Jardines de las Ánimas", municipioId: "3002", codigoPostal: "91195" },
  // Coatzacoalcos (3003)
  { id: "300301", nombre: "Centro", municipioId: "3003", codigoPostal: "96400" },
  { id: "300302", nombre: "Puerto México", municipioId: "3003", codigoPostal: "96510" },
  // Córdoba (3004)
  { id: "300401", nombre: "Centro", municipioId: "3004", codigoPostal: "94500" },
  { id: "300402", nombre: "San Dimas", municipioId: "3004", codigoPostal: "94560" },
  // Orizaba (3005)
  { id: "300501", nombre: "Centro", municipioId: "3005", codigoPostal: "94300" },
  { id: "300502", nombre: "Sur", municipioId: "3005", codigoPostal: "94340" },
  // Boca del Río (3006)
  { id: "300601", nombre: "Centro", municipioId: "3006", codigoPostal: "94290" },
  { id: "300602", nombre: "Costa de Oro", municipioId: "3006", codigoPostal: "94299" },
  // Poza Rica de Hidalgo (3007)
  { id: "300701", nombre: "Centro", municipioId: "3007", codigoPostal: "93230" },
  { id: "300702", nombre: "Arroyo del Maíz", municipioId: "3007", codigoPostal: "93340" },

  // Yucatán (31) - adicionales
  // Kanasín (3102)
  { id: "310201", nombre: "Centro", municipioId: "3102", codigoPostal: "97370" },
  { id: "310202", nombre: "San Antonio Xluch", municipioId: "3102", codigoPostal: "97375" },
  // Valladolid (3103)
  { id: "310301", nombre: "Centro", municipioId: "3103", codigoPostal: "97780" },
  { id: "310302", nombre: "San Juan", municipioId: "3103", codigoPostal: "97786" },
  // Umán (3104)
  { id: "310401", nombre: "Centro", municipioId: "3104", codigoPostal: "97390" },
  { id: "310402", nombre: "San José Tzal", municipioId: "3104", codigoPostal: "97393" },
  // Progreso (3105)
  { id: "310501", nombre: "Centro", municipioId: "3105", codigoPostal: "97320" },
  { id: "310502", nombre: "Malecón", municipioId: "3105", codigoPostal: "97320" },

  // Zacatecas (32)
  // Zacatecas (3201)
  { id: "320101", nombre: "Centro", municipioId: "3201", codigoPostal: "98000" },
  { id: "320102", nombre: "Lomas del Calvario", municipioId: "3201", codigoPostal: "98085" },
  // Guadalupe (3202)
  { id: "320201", nombre: "Centro", municipioId: "3202", codigoPostal: "98600" },
  { id: "320202", nombre: "Bernárdez", municipioId: "3202", codigoPostal: "98608" },
  // Fresnillo (3203)
  { id: "320301", nombre: "Centro", municipioId: "3203", codigoPostal: "99000" },
  { id: "320302", nombre: "Las Delicias", municipioId: "3203", codigoPostal: "99054" },
  // Jerez (3204)
  { id: "320401", nombre: "Centro", municipioId: "3204", codigoPostal: "99300" },
  { id: "320402", nombre: "La Turba", municipioId: "3204", codigoPostal: "99340" },
  // Río Grande (3205)
  { id: "320501", nombre: "Centro", municipioId: "3205", codigoPostal: "98400" },
  { id: "320502", nombre: "Emiliano Zapata", municipioId: "3205", codigoPostal: "98412" },
];

/**
 * Obtiene todos los estados de México
 */
export function getEstados(): Estado[] {
  return ESTADOS_MEXICO;
}

/**
 * Obtiene los municipios de un estado específico
 */
export function getMunicipiosPorEstado(estadoId: string): Municipio[] {
  return MUNICIPIOS_MEXICO.filter((m) => m.estadoId === estadoId);
}

/**
 * Obtiene las colonias de un municipio específico
 */
export function getColoniasPorMunicipio(municipioId: string): Colonia[] {
  return COLONIAS_MEXICO.filter((c) => c.municipioId === municipioId);
}

/**
 * Busca un estado por su nombre (búsqueda parcial, case-insensitive)
 */
export function buscarEstadoPorNombre(nombre: string): Estado | undefined {
  const nombreLower = nombre.toLowerCase();
  return ESTADOS_MEXICO.find((e) => e.nombre.toLowerCase().includes(nombreLower));
}

/**
 * Busca un municipio por su nombre dentro de un estado
 */
export function buscarMunicipioPorNombre(
  nombre: string,
  estadoId?: string
): Municipio | undefined {
  const nombreLower = nombre.toLowerCase();
  const municipios = estadoId
    ? getMunicipiosPorEstado(estadoId)
    : MUNICIPIOS_MEXICO;
  return municipios.find((m) => m.nombre.toLowerCase().includes(nombreLower));
}

/**
 * Busca una colonia por su nombre dentro de un municipio
 */
export function buscarColoniaPorNombre(
  nombre: string,
  municipioId?: string
): Colonia | undefined {
  const nombreLower = nombre.toLowerCase();
  const colonias = municipioId
    ? getColoniasPorMunicipio(municipioId)
    : COLONIAS_MEXICO;
  return colonias.find((c) => c.nombre.toLowerCase().includes(nombreLower));
}

/**
 * Obtiene el estado por ID
 */
export function getEstadoPorId(estadoId: string): Estado | undefined {
  return ESTADOS_MEXICO.find((e) => e.id === estadoId);
}

/**
 * Obtiene el municipio por ID
 */
export function getMunicipioPorId(municipioId: string): Municipio | undefined {
  return MUNICIPIOS_MEXICO.find((m) => m.id === municipioId);
}

/**
 * Obtiene la colonia por ID
 */
export function getColoniaPorId(coloniaId: string): Colonia | undefined {
  return COLONIAS_MEXICO.find((c) => c.id === coloniaId);
}

/**
 * Resultado de búsqueda por código postal
 */
export interface ResultadoBusquedaCP {
  estado: Estado;
  municipio: Municipio;
  colonias: Colonia[];
}

/**
 * Busca colonias por código postal y devuelve la información geográfica completa
 * Retorna estado, municipio y todas las colonias disponibles para ese C.P.
 */
export function buscarPorCodigoPostal(codigoPostal: string): ResultadoBusquedaCP | null {
  const cpLimpio = codigoPostal.trim();
  
  if (!cpLimpio || cpLimpio.length < 4 || cpLimpio.length > 5) {
    return null;
  }
  
  // Buscar todas las colonias con ese código postal
  const coloniasEncontradas = COLONIAS_MEXICO.filter(
    (c) => c.codigoPostal === cpLimpio
  );
  
  if (coloniasEncontradas.length === 0) {
    return null;
  }
  
  // Obtener el municipio de la primera colonia (todas deberían tener el mismo)
  const primeraColonia = coloniasEncontradas[0];
  const municipio = MUNICIPIOS_MEXICO.find((m) => m.id === primeraColonia.municipioId);
  
  if (!municipio) {
    return null;
  }
  
  // Obtener el estado del municipio
  const estado = ESTADOS_MEXICO.find((e) => e.id === municipio.estadoId);
  
  if (!estado) {
    return null;
  }
  
  return {
    estado,
    municipio,
    colonias: coloniasEncontradas,
  };
}

/**
 * Valida que el código postal corresponda al estado y municipio seleccionados
 */
export function validarConsistenciaGeografica(
  estadoNombre: string,
  municipioNombre: string,
  coloniaNombre: string,
  codigoPostal: string
): { esValido: boolean; mensaje: string } {
  // Buscar el estado
  const estado = buscarEstadoPorNombre(estadoNombre);
  if (!estado) {
    return { esValido: false, mensaje: "Estado no encontrado" };
  }
  
  // Buscar el municipio en ese estado
  const municipio = buscarMunicipioPorNombre(municipioNombre, estado.id);
  if (!municipio) {
    return { esValido: false, mensaje: "Municipio no corresponde al estado seleccionado" };
  }
  
  // Buscar la colonia en ese municipio
  const colonia = buscarColoniaPorNombre(coloniaNombre, municipio.id);
  if (!colonia) {
    return { esValido: false, mensaje: "Colonia no corresponde al municipio seleccionado" };
  }
  
  // Validar que el C.P. coincida con la colonia
  if (codigoPostal && colonia.codigoPostal !== codigoPostal) {
    return { 
      esValido: false, 
      mensaje: `El código postal ${codigoPostal} no corresponde a la colonia ${coloniaNombre}. El C.P. correcto es ${colonia.codigoPostal}` 
    };
  }
  
  return { esValido: true, mensaje: "Datos geográficos válidos" };
}

/**
 * Obtiene todos los códigos postales disponibles (para autocompletado)
 */
export function getCodigosPostalesDisponibles(): string[] {
  const codigosUnicos = new Set(COLONIAS_MEXICO.map((c) => c.codigoPostal));
  return Array.from(codigosUnicos).sort();
}

