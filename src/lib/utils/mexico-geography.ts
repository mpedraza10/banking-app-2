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

// Colonias representativas (para pruebas - enfocadas en CDMX y principales ciudades)
export const COLONIAS_MEXICO: Colonia[] = [
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

  // Monterrey, Nuevo León (1901)
  { id: "190101", nombre: "Centro", municipioId: "1901", codigoPostal: "64000" },
  { id: "190102", nombre: "Cumbres", municipioId: "1901", codigoPostal: "64610" },
  { id: "190103", nombre: "Del Valle", municipioId: "1901", codigoPostal: "66220" },
  { id: "190104", nombre: "Mitras Centro", municipioId: "1901", codigoPostal: "64460" },
  { id: "190105", nombre: "Obispado", municipioId: "1901", codigoPostal: "64060" },
  { id: "190106", nombre: "San Jerónimo", municipioId: "1901", codigoPostal: "64640" },

  // San Pedro Garza García, Nuevo León (1907)
  { id: "190701", nombre: "Del Valle", municipioId: "1907", codigoPostal: "66220" },
  { id: "190702", nombre: "Fuentes del Valle", municipioId: "1907", codigoPostal: "66220" },
  { id: "190703", nombre: "San Agustín", municipioId: "1907", codigoPostal: "66260" },
  { id: "190704", nombre: "Valle de San Ángel", municipioId: "1907", codigoPostal: "66290" },

  // Puebla, Puebla (2101)
  { id: "210101", nombre: "Centro Histórico", municipioId: "2101", codigoPostal: "72000" },
  { id: "210102", nombre: "Anzures", municipioId: "2101", codigoPostal: "72530" },
  { id: "210103", nombre: "La Paz", municipioId: "2101", codigoPostal: "72160" },
  { id: "210104", nombre: "Zavaleta", municipioId: "2101", codigoPostal: "72150" },
  { id: "210105", nombre: "Huexotitla", municipioId: "2101", codigoPostal: "72534" },

  // Toluca, Estado de México (1505)
  { id: "150501", nombre: "Centro", municipioId: "1505", codigoPostal: "50000" },
  { id: "150502", nombre: "Reforma", municipioId: "1505", codigoPostal: "50070" },
  { id: "150503", nombre: "Santa Ana Tlapaltitlán", municipioId: "1505", codigoPostal: "50160" },
  { id: "150504", nombre: "Universidad", municipioId: "1505", codigoPostal: "50130" },

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

