const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo-libros';

const bookSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  genero: { type: String, required: true },
  anioPublicacion: { type: Number, required: true },
  editorial: { type: String, required: true },
  numeroPaginas: { type: Number, required: true },
  descripcion: { type: String }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

const libros = [
  // Ficción clásica
  { titulo: "Cien años de soledad", autor: "Gabriel García Márquez", isbn: "978-84-376-0494-7", genero: "Ficción", anioPublicacion: 1967, editorial: "Editorial Sudamericana", numeroPaginas: 471, descripcion: "La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo." },
  { titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", isbn: "978-84-239-6325-1", genero: "Ficción", anioPublicacion: 1605, editorial: "Francisco de Robles", numeroPaginas: 863, descripcion: "Las aventuras de un hidalgo que enloquece leyendo libros de caballerías." },
  { titulo: "1984", autor: "George Orwell", isbn: "978-04-515-24935", genero: "Ficción", anioPublicacion: 1949, editorial: "Secker & Warburg", numeroPaginas: 328, descripcion: "Una distopía sobre un régimen totalitario que controla todos los aspectos de la vida." },
  { titulo: "Orgullo y prejuicio", autor: "Jane Austen", isbn: "978-84-206-5230-8", genero: "Ficción", anioPublicacion: 1813, editorial: "T. Egerton", numeroPaginas: 432, descripcion: "Romance y crítica social en la Inglaterra rural del siglo XIX." },
  { titulo: "Crimen y castigo", autor: "Fiódor Dostoyevski", isbn: "978-84-206-6855-2", genero: "Ficción", anioPublicacion: 1866, editorial: "The Russian Messenger", numeroPaginas: 671, descripcion: "La historia de Raskólnikov y su lucha moral tras cometer un asesinato." },
  
  // Ciencia Ficción
  { titulo: "Dune", autor: "Frank Herbert", isbn: "978-84-450-7902-4", genero: "Ciencia", anioPublicacion: 1965, editorial: "Chilton Books", numeroPaginas: 896, descripcion: "Una épica de política, religión y ecología en el planeta desértico Arrakis." },
  { titulo: "Fundación", autor: "Isaac Asimov", isbn: "978-84-9838-237-0", genero: "Ciencia", anioPublicacion: 1951, editorial: "Gnome Press", numeroPaginas: 255, descripcion: "La caída de un imperio galáctico y el plan para preservar el conocimiento." },
  { titulo: "Neuromante", autor: "William Gibson", isbn: "978-84-509-9427-8", genero: "Ciencia", anioPublicacion: 1984, editorial: "Ace Books", numeroPaginas: 271, descripcion: "Pionera del género cyberpunk, sobre hackers en un futuro distópico." },
  { titulo: "Un mundo feliz", autor: "Aldous Huxley", isbn: "978-84-339-0876-7", genero: "Ciencia", anioPublicacion: 1932, editorial: "Chatto & Windus", numeroPaginas: 268, descripcion: "Una sociedad futurista donde la felicidad es manufacturada y controlada." },
  { titulo: "Fahrenheit 451", autor: "Ray Bradbury", isbn: "978-84-450-7450-0", genero: "Ciencia", anioPublicacion: 1953, editorial: "Ballantine Books", numeroPaginas: 249, descripcion: "En un futuro donde los libros están prohibidos, un bombero cuestiona su trabajo." },
  
  // Historia
  { titulo: "Sapiens: De animales a dioses", autor: "Yuval Noah Harari", isbn: "978-84-9992-354-7", genero: "Historia", anioPublicacion: 2011, editorial: "Debate", numeroPaginas: 496, descripcion: "Una historia de la humanidad desde la Edad de Piedra hasta la actualidad." },
  { titulo: "El diario de Ana Frank", autor: "Ana Frank", isbn: "978-84-226-9200-0", genero: "Historia", anioPublicacion: 1947, editorial: "Contact Publishing", numeroPaginas: 283, descripcion: "El diario de una niña judía escondida durante la ocupación nazi." },
  { titulo: "Breve historia del tiempo", autor: "Stephen Hawking", isbn: "978-84-206-8791-1", genero: "Ciencia", anioPublicacion: 1988, editorial: "Bantam Books", numeroPaginas: 256, descripcion: "Una introducción accesible a la cosmología y los agujeros negros." },
  { titulo: "Guns, Germs, and Steel", autor: "Jared Diamond", isbn: "978-03-933-1755-8", genero: "Historia", anioPublicacion: 1997, editorial: "W. W. Norton", numeroPaginas: 498, descripcion: "Por qué algunas sociedades prosperaron más que otras." },
  { titulo: "Los miserables", autor: "Victor Hugo", isbn: "978-84-206-6103-4", genero: "Ficción", anioPublicacion: 1862, editorial: "A. Lacroix", numeroPaginas: 1232, descripcion: "La historia de Jean Valjean y su redención en la Francia del siglo XIX." },
  
  // Tecnología
  { titulo: "El código limpio", autor: "Robert C. Martin", isbn: "978-03-212-7868-4", genero: "Tecnología", anioPublicacion: 2008, editorial: "Prentice Hall", numeroPaginas: 464, descripcion: "Manual de agilidad software para escribir código mantenible." },
  { titulo: "Inteligencia Artificial: Un enfoque moderno", autor: "Stuart Russell", isbn: "978-84-832-2807-1", genero: "Tecnología", anioPublicacion: 1995, editorial: "Pearson", numeroPaginas: 1152, descripcion: "El libro de texto definitivo sobre inteligencia artificial." },
  { titulo: "El origen de las especies", autor: "Charles Darwin", isbn: "978-84-206-6830-9", genero: "Ciencia", anioPublicacion: 1859, editorial: "John Murray", numeroPaginas: 502, descripcion: "La teoría de la evolución por selección natural." },
  { titulo: "La estructura de las revoluciones científicas", autor: "Thomas Kuhn", isbn: "978-60-712-9225-5", genero: "Ciencia", anioPublicacion: 1962, editorial: "University of Chicago Press", numeroPaginas: 264, descripcion: "Cómo cambia el conocimiento científico a través de paradigmas." },
  { titulo: "El dilema del innovador", autor: "Clayton Christensen", isbn: "978-84-344-8959-3", genero: "Tecnología", anioPublicacion: 1997, editorial: "Harvard Business School Press", numeroPaginas: 252, descripcion: "Por qué las empresas exitosas pueden fracasar ante innovaciones disruptivas." },
  
  // Arte y Filosofía
  { titulo: "La historia del arte", autor: "E. H. Gombrich", isbn: "978-07-148-3247-3", genero: "Arte", anioPublicacion: 1950, editorial: "Phaidon Press", numeroPaginas: 688, descripcion: "Una introducción comprensiva a la historia del arte occidental." },
  { titulo: "La República", autor: "Platón", isbn: "978-84-206-3698-8", genero: "Historia", anioPublicacion: -380, editorial: "Gredos", numeroPaginas: 512, descripcion: "Diálogos sobre justicia, gobierno y la naturaleza del alma." },
  { titulo: "Más allá del bien y del mal", autor: "Friedrich Nietzsche", isbn: "978-84-206-3654-4", genero: "Historia", anioPublicacion: 1886, editorial: "C. G. Naumann", numeroPaginas: 272, descripcion: "Crítica de la moralidad tradicional y propuesta de nuevos valores." },
  { titulo: "El arte de la guerra", autor: "Sun Tzu", isbn: "978-84-414-3447-2", genero: "Historia", anioPublicacion: -500, editorial: "Edaf", numeroPaginas: 100, descripcion: "Tratado militar sobre estrategia y táctica." },
  { titulo: "Las venas abiertas de América Latina", autor: "Eduardo Galeano", isbn: "978-84-323-0445-6", genero: "Historia", anioPublicacion: 1971, editorial: "Siglo XXI", numeroPaginas: 379, descripcion: "Análisis del saqueo económico de América Latina." },
  
  // Literatura contemporánea
  { titulo: "El señor de los anillos", autor: "J.R.R. Tolkien", isbn: "978-84-450-7038-0", genero: "Ficción", anioPublicacion: 1954, editorial: "George Allen & Unwin", numeroPaginas: 1178, descripcion: "La épica aventura de Frodo para destruir el Anillo Único." },
  { titulo: "Harry Potter y la piedra filosofal", autor: "J.K. Rowling", isbn: "978-84-782-8800-5", genero: "Ficción", anioPublicacion: 1997, editorial: "Bloomsbury", numeroPaginas: 254, descripcion: "Un niño descubre que es mago y asiste a Hogwarts." },
  { titulo: "El código Da Vinci", autor: "Dan Brown", isbn: "978-84-080-4971-6", genero: "Ficción", anioPublicacion: 2003, editorial: "Doubleday", numeroPaginas: 489, descripcion: "Un thriller sobre secretos del cristianismo y símbolos ocultos." },
  { titulo: "La sombra del viento", autor: "Carlos Ruiz Zafón", isbn: "978-84-322-4210-7", genero: "Ficción", anioPublicacion: 2001, editorial: "Planeta", numeroPaginas: 576, descripcion: "Misterio literario ambientado en la Barcelona de posguerra." },
  { titulo: "Los pilares de la Tierra", autor: "Ken Follett", isbn: "978-84-975-9631-5", genero: "Ficción", anioPublicacion: 1989, editorial: "Plaza & Janés", numeroPaginas: 1008, descripcion: "La construcción de una catedral en la Inglaterra medieval." },
  
  // No Ficción variada
  { titulo: "Padre rico, padre pobre", autor: "Robert Kiyosaki", isbn: "978-16-121-8013-9", genero: "No Ficción", anioPublicacion: 1997, editorial: "Warner Books", numeroPaginas: 207, descripcion: "Lecciones sobre educación financiera e inversión." },
  { titulo: "El poder del ahora", autor: "Eckhart Tolle", isbn: "978-84-799-3448-8", genero: "No Ficción", anioPublicacion: 1997, editorial: "New World Library", numeroPaginas: 236, descripcion: "Guía espiritual para vivir en el momento presente." },
  { titulo: "Piensa y crece", autor: "Napoleon Hill", isbn: "978-84-413-0291-5", genero: "No Ficción", anioPublicacion: 1937, editorial: "The Ralston Society", numeroPaginas: 320, descripcion: "Principios del éxito basados en entrevistas a millonarios." },
  { titulo: "Los 7 hábitos de la gente altamente efectiva", autor: "Stephen Covey", isbn: "978-84-493-0110-2", genero: "No Ficción", anioPublicacion: 1989, editorial: "Free Press", numeroPaginas: 381, descripcion: "Enfoque holístico para el desarrollo personal y profesional." },
  { titulo: "Homo Deus", autor: "Yuval Noah Harari", isbn: "978-84-9992-877-1", genero: "Historia", anioPublicacion: 2015, editorial: "Debate", numeroPaginas: 496, descripcion: "Una visión del futuro de la humanidad." },
  
  // Más ficción variada
  { titulo: "La chica del tren", autor: "Paula Hawkins", isbn: "978-84-080-1417-3", genero: "Ficción", anioPublicacion: 2015, editorial: "Planeta", numeroPaginas: 416, descripcion: "Thriller psicológico sobre una mujer que presencia algo inquietante." },
  { titulo: "El alquimista", autor: "Paulo Coelho", isbn: "978-84-080-4446-9", genero: "Ficción", anioPublicacion: 1988, editorial: "Planeta", numeroPaginas: 192, descripcion: "Un pastor andaluz viaja a Egipto buscando su leyenda personal." },
  { titulo: "Crónica de una muerte anunciada", autor: "Gabriel García Márquez", isbn: "978-84-397-0494-2", genero: "Ficción", anioPublicacion: 1981, editorial: "Editorial Oveja Negra", numeroPaginas: 122, descripcion: "La reconstrucción de un asesinato en un pueblo colombiano." },
  { titulo: "La casa de los espíritus", autor: "Isabel Allende", isbn: "978-84-213-1839-5", genero: "Ficción", anioPublicacion: 1982, editorial: "Plaza & Janés", numeroPaginas: 432, descripcion: "Saga familiar que abarca generaciones en Chile." },
  { titulo: "El túnel", autor: "Ernesto Sabato", isbn: "978-84-322-0083-1", genero: "Ficción", anioPublicacion: 1948, editorial: "Sur", numeroPaginas: 142, descripcion: "Novela psicológica sobre obsesión y aislamiento." },
  
  // Tecnología y ciencia moderna
  { titulo: "Superinteligencia", autor: "Nick Bostrom", isbn: "978-01-987-3983-8", genero: "Tecnología", anioPublicacion: 2014, editorial: "Oxford University Press", numeroPaginas: 352, descripcion: "Los riesgos y el futuro de la inteligencia artificial." },
  { titulo: "El gen egoísta", autor: "Richard Dawkins", isbn: "978-84-206-8218-3", genero: "Ciencia", anioPublicacion: 1976, editorial: "Oxford University Press", numeroPaginas: 360, descripcion: "La evolución desde la perspectiva de los genes." },
  { titulo: "Cosmos", autor: "Carl Sagan", isbn: "978-84-206-8188-9", genero: "Ciencia", anioPublicacion: 1980, editorial: "Random House", numeroPaginas: 432, descripcion: "Un viaje por el universo y la ciencia." },
  { titulo: "El universo en una cáscara de nuez", autor: "Stephen Hawking", isbn: "978-84-206-5204-9", genero: "Ciencia", anioPublicacion: 2001, editorial: "Bantam Books", numeroPaginas: 216, descripcion: "Conceptos avanzados de física teórica explicados." },
  { titulo: "La información", autor: "James Gleick", isbn: "978-84-994-0169-6", genero: "Tecnología", anioPublicacion: 2011, editorial: "Pantheon Books", numeroPaginas: 544, descripcion: "Historia de la teoría de la información." },
  
  // Literatura latinoamericana
  { titulo: "Rayuela", autor: "Julio Cortázar", isbn: "978-84-204-0010-8", genero: "Ficción", anioPublicacion: 1963, editorial: "Editorial Sudamericana", numeroPaginas: 736, descripcion: "Novela experimental que puede leerse en diferentes órdenes." },
  { titulo: "Pedro Páramo", autor: "Juan Rulfo", isbn: "978-60-703-8050-3", genero: "Ficción", anioPublicacion: 1955, editorial: "Fondo de Cultura Económica", numeroPaginas: 142, descripcion: "Un hombre busca a su padre en un pueblo de fantasmas." },
  { titulo: "Ficciones", autor: "Jorge Luis Borges", isbn: "978-84-206-1489-4", genero: "Ficción", anioPublicacion: 1944, editorial: "Sur", numeroPaginas: 174, descripcion: "Colección de cuentos sobre laberintos, espejos e infinitos." },
  { titulo: "La ciudad y los perros", autor: "Mario Vargas Llosa", isbn: "978-84-204-0177-8", genero: "Ficción", anioPublicacion: 1963, editorial: "Seix Barral", numeroPaginas: 416, descripcion: "La vida en un colegio militar en Lima." },
  { titulo: "El amor en los tiempos del cólera", autor: "Gabriel García Márquez", isbn: "978-84-397-1574-0", genero: "Ficción", anioPublicacion: 1985, editorial: "Editorial Oveja Negra", numeroPaginas: 464, descripcion: "Una historia de amor que dura más de cincuenta años." }
];

async function seedDatabase() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Limpiando base de datos...');
    await Book.deleteMany({});

    console.log('📚 Insertando 50 libros...');
    const result = await Book.insertMany(libros);

    console.log(`✅ ${result.length} libros insertados correctamente`);
    console.log('\n📊 Resumen por género:');
    
    const stats = libros.reduce((acc, libro) => {
      acc[libro.genero] = (acc[libro.genero] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(stats).forEach(([genero, cantidad]) => {
      console.log(`   ${genero}: ${cantidad} libros`);
    });

    await mongoose.connection.close();
    console.log('\n🎉 Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();