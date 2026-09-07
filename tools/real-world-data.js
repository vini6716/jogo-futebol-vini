/**
 * Dados "reais" (ligas, clubes, seleções e jogadores conhecidos) usados por
 * generate-database.js. É uma fotografia best-effort de conhecimento público
 * sobre elencos — competições de futebol mudam a cada janela de
 * transferência, então trate isso como um retrato aproximado, não um dado
 * oficial/licenciado. Escudos e nomes de jogadores/times são reais; os
 * emblemas continuam sendo desenhados em SVG genérico no jogo (sem logos
 * oficiais).
 *
 * Cada clube: { n: nome, city, stadium, p: cor primária, s: cor secundária,
 * base: força geral (0-99), cup: nome da copa nacional (só no nível da liga),
 * real: lista "Nome|POSIÇÃO|Nacionalidade|Idade" dos jogadores conhecidos —
 * o restante do elenco até completar o plano de posições é gerado. }
 */

const LEAGUE_DEFS = [
  {
    name: "Premier League",
    country: "Inglaterra",
    cup: "FA Cup",
    clubs: [
      { n: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", p: "#6CABDD", s: "#1C2C5B", base: 90, real: [
        "Ederson|GOL|Brasil|31", "Rúben Dias|ZAG|Portugal|27", "Joško Gvardiol|ZAG|Croácia|23", "Kyle Walker|LAT|Inglaterra|34",
        "Rodri|VOL|Espanha|28", "Kevin De Bruyne|MEI|Bélgica|33", "Bernardo Silva|MEI|Portugal|30", "Phil Foden|MEI|Inglaterra|24",
        "Erling Haaland|ATA|Noruega|24", "Jack Grealish|ATA|Inglaterra|29", "Jeremy Doku|ATA|Bélgica|22" ] },
      { n: "Arsenal", city: "Londres", stadium: "Emirates Stadium", p: "#EF0107", s: "#FFFFFF", base: 88, real: [
        "David Raya|GOL|Espanha|29", "William Saliba|ZAG|França|23", "Gabriel Magalhães|ZAG|Brasil|26", "Ben White|LAT|Inglaterra|26",
        "Declan Rice|VOL|Inglaterra|25", "Martin Ødegaard|MEI|Noruega|25", "Bukayo Saka|ATA|Inglaterra|23", "Gabriel Martinelli|ATA|Brasil|23",
        "Kai Havertz|ATA|Alemanha|25", "Leandro Trossard|ATA|Bélgica|30" ] },
      { n: "Liverpool", city: "Liverpool", stadium: "Anfield", p: "#C8102E", s: "#FFFFFF", base: 88, real: [
        "Alisson Becker|GOL|Brasil|32", "Virgil van Dijk|ZAG|Holanda|33", "Ibrahima Konaté|ZAG|França|25", "Trent Alexander-Arnold|LAT|Inglaterra|26",
        "Andrew Robertson|LAT|Escócia|30", "Alexis Mac Allister|VOL|Argentina|26", "Dominik Szoboszlai|MEI|Hungria|24", "Mohamed Salah|ATA|Egito|32",
        "Darwin Núñez|ATA|Uruguai|25", "Luis Díaz|ATA|Colômbia|27", "Cody Gakpo|ATA|Holanda|25" ] },
      { n: "Manchester United", city: "Manchester", stadium: "Old Trafford", p: "#DA291C", s: "#000000", base: 82, real: [
        "André Onana|GOL|Camarões|28", "Lisandro Martínez|ZAG|Argentina|27", "Harry Maguire|ZAG|Inglaterra|31", "Diogo Dalot|LAT|Portugal|25",
        "Casemiro|VOL|Brasil|32", "Bruno Fernandes|MEI|Portugal|30", "Mason Mount|MEI|Inglaterra|26", "Marcus Rashford|ATA|Inglaterra|27",
        "Rasmus Højlund|ATA|Dinamarca|21", "Alejandro Garnacho|ATA|Argentina|20" ] },
      { n: "Chelsea", city: "Londres", stadium: "Stamford Bridge", p: "#034694", s: "#FFFFFF", base: 82, real: [
        "Robert Sánchez|GOL|Espanha|27", "Levi Colwill|ZAG|Inglaterra|21", "Wesley Fofana|ZAG|França|23", "Reece James|LAT|Inglaterra|25",
        "Moisés Caicedo|VOL|Equador|23", "Enzo Fernández|MEI|Argentina|24", "Cole Palmer|MEI|Inglaterra|22", "Nicolas Jackson|ATA|Senegal|23",
        "Christopher Nkunku|ATA|França|27" ] },
      { n: "Tottenham Hotspur", city: "Londres", stadium: "Tottenham Hotspur Stadium", p: "#132257", s: "#FFFFFF", base: 81, real: [
        "Guglielmo Vicario|GOL|Itália|28", "Cristian Romero|ZAG|Argentina|26", "Micky van de Ven|ZAG|Holanda|23", "Pedro Porro|LAT|Espanha|25",
        "Yves Bissouma|VOL|Mali|28", "James Maddison|MEI|Inglaterra|28", "Son Heung-min|ATA|Coreia do Sul|32", "Dejan Kulusevski|ATA|Suécia|24",
        "Brennan Johnson|ATA|País de Gales|23" ] },
      { n: "Newcastle United", city: "Newcastle", stadium: "St. James' Park", p: "#241F20", s: "#FFFFFF", base: 80, real: [
        "Nick Pope|GOL|Inglaterra|32", "Sven Botman|ZAG|Holanda|24", "Fabian Schär|ZAG|Suíça|32", "Kieran Trippier|LAT|Inglaterra|34",
        "Bruno Guimarães|VOL|Brasil|26", "Sandro Tonali|VOL|Itália|24", "Alexander Isak|ATA|Suécia|25", "Anthony Gordon|ATA|Inglaterra|23" ] },
      { n: "Aston Villa", city: "Birmingham", stadium: "Villa Park", p: "#670E36", s: "#95BFE5", base: 80, real: [
        "Emiliano Martínez|GOL|Argentina|32", "Ezri Konsa|ZAG|Inglaterra|26", "Pau Torres|ZAG|Espanha|27", "Lucas Digne|LAT|França|31",
        "Youri Tielemans|VOL|Bélgica|27", "John McGinn|MEI|Escócia|30", "Ollie Watkins|ATA|Inglaterra|28", "Leon Bailey|ATA|Jamaica|26",
        "Moussa Diaby|ATA|França|25" ] },
      { n: "Brighton & Hove Albion", city: "Brighton", stadium: "Falmer Stadium", p: "#0057B8", s: "#FFFFFF", base: 76, real: [
        "Bart Verbruggen|GOL|Holanda|22", "Lewis Dunk|ZAG|Inglaterra|33", "Pervis Estupiñán|LAT|Equador|26", "Carlos Baleba|VOL|Camarões|20",
        "Kaoru Mitoma|ATA|Japão|27", "João Pedro|ATA|Brasil|22", "Danny Welbeck|ATA|Inglaterra|33" ] },
      { n: "West Ham United", city: "Londres", stadium: "London Stadium", p: "#7A263A", s: "#1BB1E7", base: 76, real: [
        "Alphonse Areola|GOL|França|31", "Kurt Zouma|ZAG|França|30", "Jean-Clair Todibo|ZAG|França|24", "Vladimír Coufal|LAT|República Tcheca|32",
        "Lucas Paquetá|MEI|Brasil|27", "Mohammed Kudus|ATA|Gana|24", "Jarrod Bowen|ATA|Inglaterra|27" ] },
      { n: "Crystal Palace", city: "Londres", stadium: "Selhurst Park", p: "#1B458F", s: "#C4122E", base: 74, real: [
        "Dean Henderson|GOL|Inglaterra|27", "Marc Guéhi|ZAG|Inglaterra|24", "Tyrick Mitchell|LAT|Inglaterra|25", "Eberechi Eze|MEI|Inglaterra|26",
        "Jean-Philippe Mateta|ATA|França|27" ] },
      { n: "Fulham", city: "Londres", stadium: "Craven Cottage", p: "#000000", s: "#FFFFFF", base: 73, real: [
        "Bernd Leno|GOL|Alemanha|32", "Calvin Bassey|ZAG|Nigéria|24", "Antonee Robinson|LAT|Estados Unidos|27", "João Palhinha|VOL|Portugal|29",
        "Andreas Pereira|MEI|Brasil|28", "Raúl Jiménez|ATA|México|33" ] },
      { n: "Wolverhampton Wanderers", city: "Wolverhampton", stadium: "Molineux Stadium", p: "#FDB913", s: "#231F20", base: 73, real: [
        "José Sá|GOL|Portugal|31", "Max Kilman|ZAG|Inglaterra|27", "Rayan Aït-Nouri|LAT|Argélia|23", "João Gomes|VOL|Brasil|23",
        "Pablo Sarabia|MEI|Espanha|32", "Matheus Cunha|ATA|Brasil|25" ] },
      { n: "Everton", city: "Liverpool", stadium: "Goodison Park", p: "#003399", s: "#FFFFFF", base: 72, real: [
        "Jordan Pickford|GOL|Inglaterra|30", "Jarrad Branthwaite|ZAG|Inglaterra|22", "James Tarkowski|ZAG|Inglaterra|31",
        "Vitaliy Mykolenko|LAT|Ucrânia|25", "Abdoulaye Doucouré|VOL|Mali|31", "Dominic Calvert-Lewin|ATA|Inglaterra|27" ] },
      { n: "Brentford", city: "Londres", stadium: "Gtech Community Stadium", p: "#E30613", s: "#FFB300", base: 72, real: [
        "Mark Flekken|GOL|Holanda|31", "Ethan Pinnock|ZAG|Jamaica|31", "Nathan Collins|ZAG|Irlanda|23", "Christian Nørgaard|VOL|Dinamarca|30",
        "Bryan Mbeumo|ATA|Camarões|25", "Yoane Wissa|ATA|República Democrática do Congo|27" ] },
      { n: "Nottingham Forest", city: "Nottingham", stadium: "City Ground", p: "#DD0000", s: "#FFFFFF", base: 72, real: [
        "Matz Sels|GOL|Bélgica|32", "Murillo|ZAG|Brasil|22", "Ola Aina|LAT|Nigéria|27", "Morgan Gibbs-White|MEI|Inglaterra|24",
        "Anthony Elanga|ATA|Suécia|22", "Taiwo Awoniyi|ATA|Nigéria|26" ] },
      { n: "AFC Bournemouth", city: "Bournemouth", stadium: "Vitality Stadium", p: "#DA291C", s: "#000000", base: 71, real: [
        "Neto|GOL|Brasil|35", "Illia Zabarnyi|ZAG|Ucrânia|22", "Marcos Senesi|ZAG|Argentina|27", "Justin Kluivert|ATA|Holanda|25",
        "Dominic Solanke|ATA|Inglaterra|27", "Antoine Semenyo|ATA|Gana|24" ] },
      { n: "Leicester City", city: "Leicester", stadium: "King Power Stadium", p: "#003090", s: "#FDBE11", base: 68, real: [
        "Mads Hermansen|GOL|Dinamarca|24", "Wout Faes|ZAG|Bélgica|26", "Jamie Vardy|ATA|Inglaterra|37", "Stephy Mavididi|ATA|Estados Unidos|26" ] },
      { n: "Ipswich Town", city: "Ipswich", stadium: "Portman Road", p: "#0044A9", s: "#FFFFFF", base: 66, real: [
        "Christian Walton|GOL|Inglaterra|28", "Sam Morsy|VOL|Egito|32", "Liam Delap|ATA|Inglaterra|21" ] },
      { n: "Southampton", city: "Southampton", stadium: "St Mary's Stadium", p: "#D71920", s: "#130C0E", base: 66, real: [
        "Alex McCarthy|GOL|Inglaterra|34", "Jack Stephens|ZAG|Inglaterra|30", "Adam Armstrong|ATA|Inglaterra|27" ] },
    ],
  },
  {
    name: "La Liga",
    country: "Espanha",
    cup: "Copa del Rey",
    clubs: [
      { n: "Real Madrid", city: "Madri", stadium: "Santiago Bernabéu", p: "#FEBE10", s: "#00529F", base: 91, real: [
        "Thibaut Courtois|GOL|Bélgica|32", "Éder Militão|ZAG|Brasil|26", "Antonio Rüdiger|ZAG|Alemanha|31", "Dani Carvajal|LAT|Espanha|32",
        "Ferland Mendy|LAT|França|29", "Federico Valverde|VOL|Uruguai|26", "Jude Bellingham|MEI|Inglaterra|21", "Toni Kroos|MEI|Alemanha|34",
        "Vinícius Júnior|ATA|Brasil|24", "Rodrygo|ATA|Brasil|23", "Kylian Mbappé|ATA|França|26" ] },
      { n: "Barcelona", city: "Barcelona", stadium: "Camp Nou", p: "#A50044", s: "#004D98", base: 89, real: [
        "Marc-André ter Stegen|GOL|Alemanha|32", "Ronald Araújo|ZAG|Uruguai|25", "Pau Cubarsí|ZAG|Espanha|18", "Jules Koundé|LAT|França|26",
        "Alejandro Balde|LAT|Espanha|21", "Frenkie de Jong|VOL|Holanda|27", "Pedri|MEI|Espanha|22", "Gavi|MEI|Espanha|20",
        "Robert Lewandowski|ATA|Polônia|36", "Raphinha|ATA|Brasil|28", "Lamine Yamal|ATA|Espanha|17" ] },
      { n: "Atlético Madrid", city: "Madri", stadium: "Cívitas Metropolitano", p: "#CB3524", s: "#272E61", base: 85, real: [
        "Jan Oblak|GOL|Eslovênia|31", "José María Giménez|ZAG|Uruguai|29", "César Azpilicueta|LAT|Espanha|35", "Koke|VOL|Espanha|32",
        "Rodrigo De Paul|VOL|Argentina|30", "Antoine Griezmann|ATA|França|33", "Julián Álvarez|ATA|Argentina|24" ] },
      { n: "Girona", city: "Girona", stadium: "Estadi Montilivi", p: "#CD2534", s: "#FFFFFF", base: 78, real: [
        "Paulo Gazzaniga|GOL|Argentina|32", "Míchel|LAT|Espanha|24", "Aleix García|VOL|Espanha|27", "Artem Dovbyk|ATA|Ucrânia|27" ] },
      { n: "Athletic Bilbao", city: "Bilbau", stadium: "San Mamés", p: "#EE2523", s: "#FFFFFF", base: 79, real: [
        "Unai Simón|GOL|Espanha|27", "Aitor Paredes|ZAG|Espanha|25", "Iñigo Lekue|LAT|Espanha|31", "Mikel Vesga|VOL|Espanha|29",
        "Nico Williams|ATA|Espanha|22", "Iñaki Williams|ATA|Gana|30" ] },
      { n: "Real Sociedad", city: "San Sebastián", stadium: "Reale Arena", p: "#0067B1", s: "#FFFFFF", base: 78, real: [
        "Álex Remiro|GOL|Espanha|29", "Robin Le Normand|ZAG|Espanha|27", "Martín Zubimendi|VOL|Espanha|25", "Mikel Oyarzabal|ATA|Espanha|27",
        "Takefusa Kubo|ATA|Japão|23" ] },
      { n: "Real Betis", city: "Sevilha", stadium: "Benito Villamarín", p: "#00954C", s: "#FFFFFF", base: 76, real: [
        "Rui Silva|GOL|Portugal|30", "Germán Pezzella|ZAG|Argentina|33", "Isco|MEI|Espanha|32", "Ayoze Pérez|ATA|Espanha|31" ] },
      { n: "Villarreal", city: "Villarreal", stadium: "Estadio de la Cerámica", p: "#FFE667", s: "#005187", base: 76, real: [
        "Filip Jörgensen|GOL|Dinamarca|22", "Alexander Sørloth|ATA|Noruega|28", "Ilias Akhomach|ATA|Marrocos|20" ] },
      { n: "Valencia", city: "Valência", stadium: "Mestalla", p: "#EE3524", s: "#F4A836", base: 74, real: [
        "Giorgi Mamardashvili|GOL|Geórgia|23", "Hugo Duro|ATA|Espanha|26" ] },
      { n: "Sevilla", city: "Sevilha", stadium: "Ramón Sánchez-Pizjuán", p: "#D2001C", s: "#FFFFFF", base: 74, real: [
        "Ørjan Nyland|GOL|Noruega|33", "Loïc Badé|ZAG|França|24", "Youssef En-Nesyri|ATA|Marrocos|27" ] },
      { n: "Getafe", city: "Getafe", stadium: "Coliseum Alfonso Pérez", p: "#005CA9", s: "#FFFFFF", base: 70, real: [
        "David Soria|GOL|Espanha|31", "Borja Mayoral|ATA|Espanha|27" ] },
      { n: "Osasuna", city: "Pamplona", stadium: "El Sadar", p: "#D2001C", s: "#062454", base: 70, real: [
        "Sergio Herrera|GOL|Espanha|31", "Ante Budimir|ATA|Croácia|33" ] },
      { n: "Celta de Vigo", city: "Vigo", stadium: "Balaídos", p: "#8AC3EE", s: "#FFFFFF", base: 71, real: [
        "Vicente Guaita|GOL|Espanha|37", "Iago Aspas|ATA|Espanha|37" ] },
      { n: "Rayo Vallecano", city: "Madri", stadium: "Vallecas", p: "#C4122E", s: "#FFFFFF", base: 69, real: [
        "Augusto Batalla|GOL|Argentina|28", "Isi Palazón|ATA|Espanha|28" ] },
      { n: "Mallorca", city: "Palma", stadium: "Son Moix", p: "#CC0000", s: "#000000", base: 70, real: [
        "Predrag Rajković|GOL|Sérvia|29", "Cyle Larin|ATA|Canadá|29" ] },
      { n: "Las Palmas", city: "Las Palmas", stadium: "Estadio Gran Canaria", p: "#FFE100", s: "#005BAA", base: 68, real: [
        "Álvaro Valles|GOL|Espanha|27", "Sandro Ramírez|ATA|Espanha|29" ] },
      { n: "Deportivo Alavés", city: "Vitória-Gasteiz", stadium: "Mendizorroza", p: "#1F3F8F", s: "#FFFFFF", base: 68, real: [
        "Antonio Sivera|GOL|Espanha|27", "Kike García|ATA|Espanha|35" ] },
      { n: "Espanyol", city: "Barcelona", stadium: "RCDE Stadium", p: "#0057A8", s: "#FFFFFF", base: 67, real: [
        "Fernando Pacheco|GOL|Espanha|33", "Javi Puado|ATA|Espanha|27" ] },
      { n: "CD Leganés", city: "Leganés", stadium: "Butarque", p: "#005BAA", s: "#FFFFFF", base: 65, real: [
        "Marko Dmitrović|GOL|Sérvia|32" ] },
      { n: "Real Valladolid", city: "Valladolid", stadium: "José Zorrilla", p: "#6E2A7A", s: "#FFFFFF", base: 65, real: [
        "Guillermo Fernández|GOL|Espanha|26", "Marcos André|ATA|Brasil|28" ] },
    ],
  },
  {
    name: "Serie A",
    country: "Itália",
    cup: "Coppa Itália",
    clubs: [
      { n: "Inter de Milão", city: "Milão", stadium: "San Siro", p: "#0D3C7B", s: "#000000", base: 87, real: [
        "Yann Sommer|GOL|Suíça|36", "Alessandro Bastoni|ZAG|Itália|25", "Francesco Acerbi|ZAG|Itália|36", "Denzel Dumfries|LAT|Holanda|28",
        "Federico Dimarco|LAT|Itália|27", "Nicolò Barella|MEI|Itália|27", "Hakan Çalhanoğlu|VOL|Turquia|30", "Lautaro Martínez|ATA|Argentina|27",
        "Marcus Thuram|ATA|França|27" ] },
      { n: "AC Milan", city: "Milão", stadium: "San Siro", p: "#FB090B", s: "#000000", base: 84, real: [
        "Mike Maignan|GOL|França|29", "Theo Hernández|LAT|França|27", "Fikayo Tomori|ZAG|Inglaterra|27", "Tijjani Reijnders|MEI|Holanda|26",
        "Rafael Leão|ATA|Portugal|25", "Christian Pulisic|ATA|Estados Unidos|26", "Álvaro Morata|ATA|Espanha|32" ] },
      { n: "Juventus", city: "Turim", stadium: "Allianz Stadium", p: "#000000", s: "#FFFFFF", base: 84, real: [
        "Michele Di Gregorio|GOL|Itália|27", "Gleison Bremer|ZAG|Brasil|27", "Federico Gatti|ZAG|Itália|26", "Andrea Cambiaso|LAT|Itália|24",
        "Manuel Locatelli|VOL|Itália|26", "Teun Koopmeiners|MEI|Holanda|26", "Dušan Vlahović|ATA|Sérvia|24", "Kenan Yıldız|ATA|Turquia|19" ] },
      { n: "Napoli", city: "Nápoles", stadium: "Diego Armando Maradona", p: "#12A0D7", s: "#FFFFFF", base: 83, real: [
        "Alex Meret|GOL|Itália|27", "Juan Jesus|ZAG|Brasil|33", "Giovanni Di Lorenzo|LAT|Itália|31", "Scott McTominay|VOL|Escócia|27",
        "Romelu Lukaku|ATA|Bélgica|31", "Khvicha Kvaratskhelia|ATA|Geórgia|23" ] },
      { n: "AS Roma", city: "Roma", stadium: "Stadio Olímpico", p: "#8E1F2F", s: "#F0BC42", base: 79, real: [
        "Mile Svilar|GOL|Sérvia|25", "Gianluca Mancini|ZAG|Itália|28", "Bryan Cristante|VOL|Itália|29", "Lorenzo Pellegrini|MEI|Itália|28",
        "Paulo Dybala|ATA|Argentina|30" ] },
      { n: "Lazio", city: "Roma", stadium: "Stadio Olímpico", p: "#87CEEB", s: "#FFFFFF", base: 78, real: [
        "Ivan Provedel|GOL|Itália|30", "Alessio Romagnoli|ZAG|Itália|29", "Mattia Zaccagni|ATA|Itália|29", "Valentín Castellanos|ATA|Argentina|26" ] },
      { n: "Atalanta", city: "Bérgamo", stadium: "Gewiss Stadium", p: "#1E71B8", s: "#000000", base: 80, real: [
        "Marco Carnesecchi|GOL|Itália|24", "Ademola Lookman|ATA|Nigéria|26", "Mateo Retegui|ATA|Argentina|25" ] },
      { n: "Fiorentina", city: "Florença", stadium: "Artemio Franchi", p: "#5B2A86", s: "#FFFFFF", base: 76, real: [
        "David De Gea|GOL|Espanha|33", "Moise Kean|ATA|Itália|24" ] },
      { n: "Bologna", city: "Bolonha", stadium: "Renato Dall'Ara", p: "#A6192E", s: "#1E3888", base: 75, real: [
        "Łukasz Skorupski|GOL|Polônia|33", "Riccardo Orsolini|ATA|Itália|27" ] },
      { n: "Torino", city: "Turim", stadium: "Stadio Olímpico Grande Torino", p: "#841F27", s: "#FFFFFF", base: 71, real: [
        "Vanja Milinković-Savić|GOL|Sérvia|27", "Duván Zapata|ATA|Colômbia|33" ] },
      { n: "Udinese", city: "Udine", stadium: "Bluenergy Stadium", p: "#000000", s: "#FFFFFF", base: 69, real: [
        "Maduka Okoye|GOL|Nigéria|25", "Lorenzo Lucca|ATA|Itália|23" ] },
      { n: "Genoa", city: "Gênova", stadium: "Luigi Ferraris", p: "#B41E24", s: "#002B5C", base: 68, real: [
        "Pierluigi Gollini|GOL|Itália|29" ] },
      { n: "Monza", city: "Monza", stadium: "U-Power Stadium", p: "#C8102E", s: "#FFFFFF", base: 67, real: [
        "Stefano Turati|GOL|Itália|22", "Daniel Maldini|MEI|Itália|22" ] },
      { n: "Hellas Verona", city: "Verona", stadium: "Marcantonio Bentegodi", p: "#FCE300", s: "#003DA5", base: 65, real: [] },
      { n: "Cagliari", city: "Cagliari", stadium: "Unipol Domus", p: "#A6192E", s: "#00205B", base: 65, real: [] },
      { n: "Lecce", city: "Lecce", stadium: "Via del Mare", p: "#FFD700", s: "#C8102E", base: 64, real: [] },
      { n: "Parma", city: "Parma", stadium: "Ennio Tardini", p: "#FFCE00", s: "#002B5C", base: 64, real: [] },
      { n: "Como 1907", city: "Como", stadium: "Giuseppe Sinigaglia", p: "#003DA5", s: "#FFFFFF", base: 63, real: [] },
      { n: "Empoli", city: "Empoli", stadium: "Carlo Castellani", p: "#005BAC", s: "#FFFFFF", base: 63, real: [] },
      { n: "Venezia", city: "Veneza", stadium: "Pierluigi Penzo", p: "#F5811F", s: "#000000", base: 62, real: [] },
    ],
  },
  {
    name: "Bundesliga",
    country: "Alemanha",
    cup: "DFB-Pokal",
    clubs: [
      { n: "Bayern de Munique", city: "Munique", stadium: "Allianz Arena", p: "#DC052D", s: "#0066B2", base: 89, real: [
        "Manuel Neuer|GOL|Alemanha|38", "Dayot Upamecano|ZAG|França|25", "Kim Min-jae|ZAG|Coreia do Sul|27", "Joshua Kimmich|LAT|Alemanha|29",
        "Alphonso Davies|LAT|Canadá|24", "Leon Goretzka|VOL|Alemanha|29", "Jamal Musiala|MEI|Alemanha|21", "Harry Kane|ATA|Inglaterra|31",
        "Serge Gnabry|ATA|Alemanha|29", "Michael Olise|ATA|França|22" ] },
      { n: "Borussia Dortmund", city: "Dortmund", stadium: "Signal Iduna Park", p: "#FDE100", s: "#000000", base: 82, real: [
        "Gregor Kobel|GOL|Suíça|26", "Nico Schlotterbeck|ZAG|Alemanha|24", "Julian Ryerson|LAT|Noruega|26", "Marcel Sabitzer|VOL|Áustria|30",
        "Julian Brandt|MEI|Alemanha|28", "Karim Adeyemi|ATA|Alemanha|22", "Maximilian Beier|ATA|Alemanha|21" ] },
      { n: "RB Leipzig", city: "Leipzig", stadium: "Red Bull Arena", p: "#DD0741", s: "#FFFFFF", base: 81, real: [
        "Péter Gulácsi|GOL|Hungria|34", "Willi Orbán|ZAG|Hungria|31", "Xavi Simons|MEI|Holanda|21", "Benjamin Šeško|ATA|Eslovênia|21",
        "Loïs Openda|ATA|Bélgica|24" ] },
      { n: "Bayer Leverkusen", city: "Leverkusen", stadium: "BayArena", p: "#E32221", s: "#000000", base: 84, real: [
        "Matěj Kovář|GOL|República Tcheca|24", "Jonathan Tah|ZAG|Alemanha|28", "Jeremie Frimpong|LAT|Holanda|23", "Granit Xhaka|VOL|Suíça|31",
        "Florian Wirtz|MEI|Alemanha|21", "Victor Boniface|ATA|Nigéria|23" ] },
      { n: "Eintracht Frankfurt", city: "Frankfurt", stadium: "Deutsche Bank Park", p: "#E1000F", s: "#000000", base: 76, real: [
        "Kevin Trapp|GOL|Alemanha|34", "Omar Marmoush|ATA|Egito|25" ] },
      { n: "VfB Stuttgart", city: "Stuttgart", stadium: "MHPArena", p: "#E32219", s: "#FFFFFF", base: 78, real: [
        "Alexander Nübel|GOL|Alemanha|27", "Waldemar Anton|ZAG|Alemanha|27", "Deniz Undav|ATA|Alemanha|28" ] },
      { n: "Borussia Mönchengladbach", city: "Mönchengladbach", stadium: "Borussia-Park", p: "#000000", s: "#FFFFFF", base: 72, real: [] },
      { n: "VfL Wolfsburg", city: "Wolfsburgo", stadium: "Volkswagen Arena", p: "#65B32E", s: "#FFFFFF", base: 71, real: [] },
      { n: "SC Freiburg", city: "Friburgo", stadium: "Europa-Park Stadion", p: "#000000", s: "#DD0000", base: 73, real: [] },
      { n: "1. FC Union Berlin", city: "Berlim", stadium: "An der Alten Försterei", p: "#EB1923", s: "#FFFFFF", base: 71, real: [] },
      { n: "Werder Bremen", city: "Bremen", stadium: "Weserstadion", p: "#009036", s: "#FFFFFF", base: 70, real: [] },
      { n: "Mainz 05", city: "Mainz", stadium: "Mewa Arena", p: "#C3141E", s: "#FFFFFF", base: 69, real: [] },
      { n: "TSG Hoffenheim", city: "Sinsheim", stadium: "PreZero Arena", p: "#1961B5", s: "#FFFFFF", base: 69, real: [] },
      { n: "FC Augsburg", city: "Augsburgo", stadium: "WWK Arena", p: "#BA3733", s: "#00543C", base: 67, real: [] },
      { n: "1. FC Heidenheim", city: "Heidenheim", stadium: "Voith-Arena", p: "#C8102E", s: "#003DA5", base: 65, real: [] },
      { n: "FC St. Pauli", city: "Hamburgo", stadium: "Millerntor-Stadion", p: "#8B4513", s: "#FFFFFF", base: 65, real: [] },
      { n: "VfL Bochum", city: "Bochum", stadium: "Vonovia Ruhrstadion", p: "#005CA9", s: "#FFFFFF", base: 64, real: [] },
      { n: "Holstein Kiel", city: "Kiel", stadium: "Holstein-Stadion", p: "#003399", s: "#C8102E", base: 63, real: [] },
    ],
  },
  {
    name: "Ligue 1",
    country: "França",
    cup: "Coupe de France",
    clubs: [
      { n: "Paris Saint-Germain", city: "Paris", stadium: "Parc des Princes", p: "#004170", s: "#DA291C", base: 87, real: [
        "Gianluigi Donnarumma|GOL|Itália|25", "Marquinhos|ZAG|Brasil|30", "Achraf Hakimi|LAT|Marrocos|25", "Nuno Mendes|LAT|Portugal|22",
        "Vitinha|VOL|Portugal|24", "Warren Zaïre-Emery|MEI|França|18", "Ousmane Dembélé|ATA|França|27", "Bradley Barcola|ATA|França|22",
        "Randal Kolo Muani|ATA|França|25" ] },
      { n: "AS Monaco", city: "Mônaco", stadium: "Stade Louis II", p: "#E51A23", s: "#FFFFFF", base: 78, real: [
        "Radosław Majecki|GOL|Polônia|24", "Wilfried Singo|ZAG|Costa do Marfim|23", "Youssouf Fofana|VOL|França|25", "Takumi Minamino|ATA|Japão|29" ] },
      { n: "Olympique de Marselha", city: "Marselha", stadium: "Orange Vélodrome", p: "#2FAEE0", s: "#FFFFFF", base: 78, real: [
        "Pau López|GOL|Espanha|29", "Leonardo Balerdi|ZAG|Argentina|25", "Adrien Rabiot|VOL|França|29", "Mason Greenwood|ATA|Inglaterra|23" ] },
      { n: "Lille OSC", city: "Lille", stadium: "Stade Pierre-Mauroy", p: "#E2001A", s: "#FFFFFF", base: 76, real: [
        "Lucas Chevalier|GOL|França|22", "Jonathan David|ATA|Canadá|24" ] },
      { n: "Olympique Lyonnais", city: "Lyon", stadium: "Groupama Stadium", p: "#1B0C77", s: "#DA291C", base: 75, real: [
        "Lucas Perri|GOL|Brasil|26", "Alexandre Lacazette|ATA|França|33" ] },
      { n: "OGC Nice", city: "Nice", stadium: "Allianz Riviera", p: "#ED1C24", s: "#000000", base: 74, real: [
        "Marcin Bułka|GOL|Polônia|24", "Terem Moffi|ATA|Nigéria|25" ] },
      { n: "RC Lens", city: "Lens", stadium: "Stade Bollaert-Delelis", p: "#FFD100", s: "#C8102E", base: 73, real: [
        "Brice Samba|GOL|França|30", "Elye Wahi|ATA|França|21" ] },
      { n: "Stade Rennais", city: "Rennes", stadium: "Roazhon Park", p: "#E2231A", s: "#000000", base: 71, real: [] },
      { n: "Toulouse FC", city: "Toulouse", stadium: "Stadium de Toulouse", p: "#6C2A7E", s: "#FFFFFF", base: 68, real: [] },
      { n: "RC Strasbourg", city: "Estrasburgo", stadium: "Stade de la Meinau", p: "#1D4F91", s: "#FFFFFF", base: 67, real: [] },
      { n: "Stade de Reims", city: "Reims", stadium: "Stade Auguste-Delaune", p: "#E2001A", s: "#FFFFFF", base: 66, real: [] },
      { n: "FC Nantes", city: "Nantes", stadium: "Stade de la Beaujoire", p: "#FFDD00", s: "#007A3D", base: 66, real: [] },
      { n: "Montpellier HSC", city: "Montpellier", stadium: "Stade de la Mosson", p: "#004A93", s: "#F58220", base: 65, real: [] },
      { n: "Stade Brestois", city: "Brest", stadium: "Stade Francis-Le Blé", p: "#E2001A", s: "#FFFFFF", base: 68, real: [] },
      { n: "Le Havre AC", city: "Le Havre", stadium: "Stade Océane", p: "#1D4F91", s: "#FFFFFF", base: 63, real: [] },
      { n: "Angers SCO", city: "Angers", stadium: "Stade Raymond-Kopa", p: "#000000", s: "#FFFFFF", base: 62, real: [] },
      { n: "AJ Auxerre", city: "Auxerre", stadium: "Stade Abbé-Deschamps", p: "#002F87", s: "#FFFFFF", base: 62, real: [] },
      { n: "AS Saint-Étienne", city: "Saint-Étienne", stadium: "Stade Geoffroy-Guichard", p: "#4CA943", s: "#FFFFFF", base: 64, real: [] },
    ],
  },
  {
    name: "Campeonato Brasileiro Série A",
    country: "Brasil",
    cup: "Copa do Brasil",
    clubs: [
      { n: "Flamengo", city: "Rio de Janeiro", stadium: "Maracanã", p: "#C52020", s: "#000000", base: 86, real: [
        "Agustín Rossi|GOL|Argentina|29", "Léo Pereira|ZAG|Brasil|28", "Fabrício Bruno|ZAG|Brasil|28", "Wesley|LAT|Brasil|21",
        "Ayrton Lucas|LAT|Brasil|26", "Erick Pulgar|VOL|Chile|30", "Gerson|MEI|Brasil|27", "Everton Ribeiro|MEI|Brasil|35",
        "Pedro|ATA|Brasil|27", "Bruno Henrique|ATA|Brasil|33", "Luiz Araújo|ATA|Brasil|28" ] },
      { n: "Palmeiras", city: "São Paulo", stadium: "Allianz Parque", p: "#006437", s: "#FFFFFF", base: 86, real: [
        "Weverton|GOL|Brasil|36", "Gustavo Gómez|ZAG|Paraguai|30", "Murilo|ZAG|Brasil|26", "Marcos Rocha|LAT|Brasil|35",
        "Piquerez|LAT|Uruguai|27", "Richard Ríos|VOL|Colômbia|24", "Raphael Veiga|MEI|Brasil|29", "Estêvão|ATA|Brasil|17",
        "Flaco López|ATA|Argentina|23" ] },
      { n: "São Paulo", city: "São Paulo", stadium: "Morumbis", p: "#C0392B", s: "#000000", base: 79, real: [
        "Rafael|GOL|Brasil|38", "Arboleda|ZAG|Equador|28", "Wellington Rato|MEI|Brasil|29", "Jonathan Calleri|ATA|Argentina|30" ] },
      { n: "Corinthians", city: "São Paulo", stadium: "Neo Química Arena", p: "#000000", s: "#FFFFFF", base: 78, real: [
        "Hugo Souza|GOL|Brasil|26", "Fagner|LAT|Brasil|35", "Rodrigo Garro|MEI|Argentina|27", "Yuri Alberto|ATA|Brasil|23" ] },
      { n: "Fluminense", city: "Rio de Janeiro", stadium: "Maracanã", p: "#830E29", s: "#006437", base: 79, real: [
        "Fábio|GOL|Brasil|43", "Nino|ZAG|Brasil|29", "Ganso|MEI|Brasil|34", "Germán Cano|ATA|Argentina|36" ] },
      { n: "Botafogo", city: "Rio de Janeiro", stadium: "Nilton Santos", p: "#000000", s: "#FFFFFF", base: 82, real: [
        "John|GOL|Brasil|29", "Alexander Barboza|ZAG|Argentina|24", "Marlon Freitas|VOL|Brasil|28", "Tiquinho Soares|ATA|Brasil|33",
        "Luiz Henrique|ATA|Brasil|22" ] },
      { n: "Grêmio", city: "Porto Alegre", stadium: "Arena do Grêmio", p: "#0038A8", s: "#000000", base: 76, real: [
        "Marchesín|GOL|Argentina|36", "Kannemann|ZAG|Argentina|32", "Cristaldo|MEI|Argentina|27", "Braithwaite|ATA|Dinamarca|33" ] },
      { n: "Internacional", city: "Porto Alegre", stadium: "Beira-Rio", p: "#E4002B", s: "#FFFFFF", base: 76, real: [
        "Rochet|GOL|Uruguai|29", "Vitão|ZAG|Brasil|24", "Alan Patrick|MEI|Brasil|33", "Enner Valencia|ATA|Equador|34" ] },
      { n: "Atlético Mineiro", city: "Belo Horizonte", stadium: "Arena MRV", p: "#000000", s: "#FFFFFF", base: 79, real: [
        "Everson|GOL|Brasil|34", "Junior Alonso|ZAG|Paraguai|29", "Rubens|LAT|Brasil|25", "Paulinho|ATA|Brasil|24", "Hulk|ATA|Brasil|38" ] },
      { n: "Cruzeiro", city: "Belo Horizonte", stadium: "Mineirão", p: "#003DA5", s: "#FFFFFF", base: 75, real: [
        "Cássio|GOL|Brasil|37", "William|LAT|Brasil|29", "Matheus Pereira|MEI|Brasil|28" ] },
      { n: "Bahia", city: "Salvador", stadium: "Arena Fonte Nova", p: "#1560BD", s: "#E4002B", base: 74, real: [
        "Marcos Felipe|GOL|Brasil|29", "Everaldo|ATA|Brasil|28" ] },
      { n: "Vasco da Gama", city: "Rio de Janeiro", stadium: "São Januário", p: "#000000", s: "#FFFFFF", base: 72, real: [
        "Léo Jardim|GOL|Brasil|27", "Payet|MEI|França|37" ] },
      { n: "Santos", city: "Santos", stadium: "Vila Belmiro", p: "#000000", s: "#FFFFFF", base: 71, real: [
        "Gabriel Brazão|GOL|Brasil|24", "Guilherme|ATA|Brasil|22" ] },
      { n: "Fortaleza", city: "Fortaleza", stadium: "Castelão", p: "#1560BD", s: "#C8102E", base: 74, real: [
        "João Ricardo|GOL|Brasil|32", "Lucero|ATA|Argentina|30" ] },
      { n: "Red Bull Bragantino", city: "Bragança Paulista", stadium: "Nabi Abi Chedid", p: "#E4002B", s: "#FFFFFF", base: 73, real: [
        "Cleiton|GOL|Brasil|30", "Eduardo Sasha|ATA|Brasil|32" ] },
      { n: "Athletico Paranaense", city: "Curitiba", stadium: "Ligga Arena", p: "#C8102E", s: "#000000", base: 72, real: [] },
      { n: "Criciúma", city: "Criciúma", stadium: "Heriberto Hülse", p: "#000000", s: "#FFD700", base: 65, real: [] },
      { n: "Cuiabá", city: "Cuiabá", stadium: "Arena Pantanal", p: "#006341", s: "#FFD700", base: 65, real: [] },
      { n: "Vitória", city: "Salvador", stadium: "Barradão", p: "#C8102E", s: "#000000", base: 66, real: [] },
      { n: "Juventude", city: "Caxias do Sul", stadium: "Alfredo Jaconi", p: "#006341", s: "#FFFFFF", base: 65, real: [] },
    ],
  },
  {
    name: "Liga Portugal",
    country: "Portugal",
    cup: "Taça de Portugal",
    clubs: [
      { n: "Benfica", city: "Lisboa", stadium: "Estádio da Luz", p: "#E4002B", s: "#FFFFFF", base: 83, real: [
        "Anatoliy Trubin|GOL|Ucrânia|23", "António Silva|ZAG|Portugal|20", "Alexander Bah|LAT|Dinamarca|28", "Orkun Kökçü|VOL|Turquia|23",
        "Ángel Di María|ATA|Argentina|36", "Rafa Silva|ATA|Portugal|31" ] },
      { n: "Porto", city: "Porto", stadium: "Estádio do Dragão", p: "#003DA5", s: "#FFFFFF", base: 83, real: [
        "Diogo Costa|GOL|Portugal|25", "Pepe|ZAG|Portugal|41", "Iván Marcano|ZAG|Espanha|38", "Galeno|ATA|Brasil|27" ] },
      { n: "Sporting CP", city: "Lisboa", stadium: "Estádio José Alvalade", p: "#007A33", s: "#FFFFFF", base: 84, real: [
        "Franco Israel|GOL|Uruguai|24", "Gonçalo Inácio|ZAG|Portugal|23", "Viktor Gyökeres|ATA|Suécia|26", "Pedro Gonçalves|MEI|Portugal|26" ] },
      { n: "Braga", city: "Braga", stadium: "Estádio Municipal de Braga", p: "#E4002B", s: "#FFFFFF", base: 76, real: [] },
      { n: "Vitória de Guimarães", city: "Guimarães", stadium: "Estádio D. Afonso Henriques", p: "#FFFFFF", s: "#000000", base: 71, real: [] },
      { n: "Boavista", city: "Porto", stadium: "Estádio do Bessa", p: "#000000", s: "#FFFFFF", base: 66, real: [] },
      { n: "Famalicão", city: "Famalicão", stadium: "Estádio Municipal de Famalicão", p: "#FFFFFF", s: "#000000", base: 66, real: [] },
      { n: "Casa Pia", city: "Lisboa", stadium: "Estádio Pina Manique", p: "#00A650", s: "#000000", base: 64, real: [] },
      { n: "Rio Ave", city: "Vila do Conde", stadium: "Estádio dos Arcos", p: "#00A650", s: "#FFFFFF", base: 64, real: [] },
      { n: "Moreirense", city: "Moreira de Cónegos", stadium: "Estádio Comendador Joaquim Almeida Freitas", p: "#00A650", s: "#FFFFFF", base: 63, real: [] },
      { n: "Estoril Praia", city: "Estoril", stadium: "Estádio António Coimbra da Mota", p: "#FFD700", s: "#000000", base: 64, real: [] },
      { n: "Arouca", city: "Arouca", stadium: "Estádio Municipal de Arouca", p: "#FFD700", s: "#000000", base: 63, real: [] },
      { n: "Gil Vicente", city: "Barcelos", stadium: "Estádio Cidade de Barcelos", p: "#C8102E", s: "#FFFFFF", base: 63, real: [] },
      { n: "Farense", city: "Faro", stadium: "Estádio de São Luís", p: "#009639", s: "#FFFFFF", base: 62, real: [] },
      { n: "Santa Clara", city: "Ponta Delgada", stadium: "Estádio de São Miguel", p: "#FFD700", s: "#000000", base: 62, real: [] },
      { n: "Estrela da Amadora", city: "Amadora", stadium: "Estádio José Gomes", p: "#00A650", s: "#FFFFFF", base: 61, real: [] },
      { n: "Nacional", city: "Funchal", stadium: "Estádio da Madeira", p: "#000000", s: "#FFD700", base: 61, real: [] },
      { n: "AVS", city: "Vila das Aves", stadium: "Estádio do CD Aves", p: "#000000", s: "#FFFFFF", base: 60, real: [] },
    ],
  },
  {
    name: "Eredivisie",
    country: "Holanda",
    cup: "KNVB Beker",
    clubs: [
      { n: "Ajax", city: "Amsterdã", stadium: "Johan Cruyff Arena", p: "#D2122E", s: "#FFFFFF", base: 78, real: [
        "Remko Pasveer|GOL|Holanda|40", "Jorrel Hato|ZAG|Holanda|18", "Steven Bergwijn|ATA|Holanda|26", "Brian Brobbey|ATA|Holanda|22" ] },
      { n: "PSV Eindhoven", city: "Eindhoven", stadium: "Philips Stadion", p: "#ED1C24", s: "#FFFFFF", base: 81, real: [
        "Walter Benítez|GOL|Argentina|31", "Jordan Teze|LAT|Holanda|24", "Malik Tillman|MEI|Estados Unidos|22", "Luuk de Jong|ATA|Holanda|34" ] },
      { n: "Feyenoord", city: "Roterdã", stadium: "De Kuip", p: "#E01C13", s: "#FFFFFF", base: 79, real: [
        "Justin Bijlow|GOL|Holanda|26", "Quilindschy Hartman|LAT|Holanda|23", "Santiago Giménez|ATA|México|23" ] },
      { n: "AZ Alkmaar", city: "Alkmaar", stadium: "AFAS Stadion", p: "#D2122E", s: "#FFFFFF", base: 72, real: [] },
      { n: "FC Twente", city: "Enschede", stadium: "De Grolsch Veste", p: "#D2122E", s: "#FFFFFF", base: 71, real: [] },
      { n: "FC Utrecht", city: "Utrecht", stadium: "Stadion Galgenwaard", p: "#C8102E", s: "#FFFFFF", base: 68, real: [] },
      { n: "Vitesse", city: "Arnhem", stadium: "GelreDome", p: "#FFD700", s: "#000000", base: 62, real: [] },
      { n: "Heerenveen", city: "Heerenveen", stadium: "Abe Lenstra Stadion", p: "#0033A0", s: "#FFFFFF", base: 65, real: [] },
      { n: "Sparta Rotterdam", city: "Roterdã", stadium: "Het Kasteel", p: "#C8102E", s: "#FFFFFF", base: 63, real: [] },
      { n: "Go Ahead Eagles", city: "Deventer", stadium: "De Adelaarshorst", p: "#FFD700", s: "#000000", base: 63, real: [] },
      { n: "NEC Nijmegen", city: "Nijmegen", stadium: "Goffertstadion", p: "#000000", s: "#C8102E", base: 62, real: [] },
      { n: "Fortuna Sittard", city: "Sittard", stadium: "Fortuna Sittard Stadion", p: "#FFD700", s: "#000000", base: 61, real: [] },
      { n: "Heracles Almelo", city: "Almelo", stadium: "Erve Asito", p: "#FFFFFF", s: "#000000", base: 61, real: [] },
      { n: "PEC Zwolle", city: "Zwolle", stadium: "MAC3PARK Stadion", p: "#0033A0", s: "#FFFFFF", base: 61, real: [] },
      { n: "Willem II", city: "Tilburg", stadium: "Koning Willem II Stadion", p: "#C8102E", s: "#FFFFFF", base: 60, real: [] },
      { n: "NAC Breda", city: "Breda", stadium: "Rat Verlegh Stadion", p: "#FFD700", s: "#000000", base: 60, real: [] },
      { n: "Almere City", city: "Almere", stadium: "Yanmar Stadion", p: "#000000", s: "#FFD700", base: 58, real: [] },
      { n: "FC Groningen", city: "Groningen", stadium: "Euroborg", p: "#00A65C", s: "#FFFFFF", base: 63, real: [] },
    ],
  },
  {
    name: "Campeonato Brasileiro Série B",
    country: "Brasil",
    cup: null,
    clubs: [
      { n: "Vila Nova", city: "Goiânia", stadium: "Estádio Onésio Brasileiro Alvarenga", p: "#C8102E", s: "#000000", base: 60, real: [] },
      { n: "Coritiba", city: "Curitiba", stadium: "Couto Pereira", p: "#00954C", s: "#FFFFFF", base: 61, real: [] },
      { n: "Avaí", city: "Florianópolis", stadium: "Ressacada", p: "#003DA5", s: "#FFFFFF", base: 59, real: [] },
      { n: "Chapecoense", city: "Chapecó", stadium: "Arena Condá", p: "#00954C", s: "#FFFFFF", base: 58, real: [] },
      { n: "Guarani", city: "Campinas", stadium: "Brinco de Ouro da Princesa", p: "#000000", s: "#008542", base: 58, real: [] },
      { n: "Ponte Preta", city: "Campinas", stadium: "Moisés Lucarelli", p: "#000000", s: "#FFFFFF", base: 58, real: [] },
      { n: "Novorizontino", city: "Novo Horizonte", stadium: "Jorge Ismael de Biasi", p: "#C8102E", s: "#FFFFFF", base: 60, real: [] },
      { n: "Amazonas", city: "Manaus", stadium: "Arena da Amazônia", p: "#003DA5", s: "#FFFFFF", base: 56, real: [] },
      { n: "Operário-PR", city: "Ponta Grossa", stadium: "Germano Krüger", p: "#00954C", s: "#FFFFFF", base: 57, real: [] },
      { n: "CRB", city: "Maceió", stadium: "Rei Pelé", p: "#C8102E", s: "#FFFFFF", base: 61, real: [] },
      { n: "Ceará", city: "Fortaleza", stadium: "Castelão", p: "#000000", s: "#FFFFFF", base: 62, real: [] },
      { n: "Sport Recife", city: "Recife", stadium: "Ilha do Retiro", p: "#C8102E", s: "#000000", base: 61, real: [] },
      { n: "Goiás", city: "Goiânia", stadium: "Serra Dourada", p: "#00954C", s: "#FFFFFF", base: 60, real: [] },
      { n: "Botafogo-SP", city: "Ribeirão Preto", stadium: "Santa Cruz", p: "#000000", s: "#FFFFFF", base: 55, real: [] },
      { n: "América-MG", city: "Belo Horizonte", stadium: "Independência", p: "#00954C", s: "#FFFFFF", base: 58, real: [] },
      { n: "Paysandu", city: "Belém", stadium: "Curuzu", p: "#003DA5", s: "#C8102E", base: 57, real: [] },
      { n: "Athletic Club", city: "São João del-Rei", stadium: "Aluízio Pimenta", p: "#000000", s: "#FFFFFF", base: 54, real: [] },
      { n: "Mirassol", city: "Mirassol", stadium: "José Maria de Campos Maia", p: "#FFD700", s: "#00954C", base: 59, real: [] },
      { n: "Volta Redonda", city: "Volta Redonda", stadium: "Raulino de Oliveira", p: "#FFD700", s: "#000000", base: 54, real: [] },
      { n: "Brusque", city: "Brusque", stadium: "Augusto Bauer", p: "#FFD700", s: "#000000", base: 54, real: [] },
    ],
  },
  {
    name: "Campeonato Brasileiro Série C",
    country: "Brasil",
    cup: null,
    clubs: [
      { n: "Remo", city: "Belém", stadium: "Baenão", p: "#003DA5", s: "#C8102E", base: 52, real: [] },
      { n: "Náutico", city: "Recife", stadium: "Aflitos", p: "#C8102E", s: "#FFFFFF", base: 52, real: [] },
      { n: "ABC", city: "Natal", stadium: "Frasqueirão", p: "#000000", s: "#FFFFFF", base: 50, real: [] },
      { n: "Confiança", city: "Aracaju", stadium: "Batistão", p: "#C8102E", s: "#000000", base: 49, real: [] },
      { n: "CSA", city: "Maceió", stadium: "Rei Pelé", p: "#003DA5", s: "#FFFFFF", base: 50, real: [] },
      { n: "Ferroviária", city: "Araraquara", stadium: "Fonte Luminosa", p: "#003DA5", s: "#FFFFFF", base: 50, real: [] },
      { n: "São Bernardo", city: "São Bernardo do Campo", stadium: "1º de Maio", p: "#000000", s: "#FFFFFF", base: 49, real: [] },
      { n: "Botafogo-PB", city: "João Pessoa", stadium: "Almeidão", p: "#000000", s: "#FFFFFF", base: 48, real: [] },
      { n: "Floresta", city: "Fortaleza", stadium: "Elzir Cabral", p: "#00954C", s: "#FFFFFF", base: 48, real: [] },
      { n: "Tombense", city: "Tombos", stadium: "Soares de Barros", p: "#003DA5", s: "#FFFFFF", base: 52, real: [] },
      { n: "Ypiranga-RS", city: "Erechim", stadium: "Colosso da Lagoa", p: "#000000", s: "#FFFFFF", base: 49, real: [] },
      { n: "Caxias", city: "Caxias do Sul", stadium: "Centenário", p: "#C8102E", s: "#FFFFFF", base: 49, real: [] },
      { n: "São José-RS", city: "Porto Alegre", stadium: "Passo D'Areia", p: "#C8102E", s: "#000000", base: 47, real: [] },
      { n: "Anápolis", city: "Anápolis", stadium: "Jonas Duarte", p: "#000000", s: "#FFD700", base: 47, real: [] },
      { n: "Maringá", city: "Maringá", stadium: "Willie Davids", p: "#FF6600", s: "#000000", base: 47, real: [] },
      { n: "Aparecidense", city: "Aparecida de Goiânia", stadium: "Walter Sampaio", p: "#003DA5", s: "#FFFFFF", base: 47, real: [] },
      { n: "Sampaio Corrêa", city: "São Luís", stadium: "Castelão do Maranhão", p: "#C8102E", s: "#000000", base: 50, real: [] },
      { n: "Itabaiana", city: "Itabaiana", stadium: "Etelvino Mendonça", p: "#000000", s: "#FFFFFF", base: 45, real: [] },
      { n: "Retrô", city: "Camaragibe", stadium: "Estádio do Retrô", p: "#000000", s: "#FFD700", base: 47, real: [] },
      { n: "Altos", city: "Teresina", stadium: "Assis Chateaubriand", p: "#000000", s: "#FFFFFF", base: 46, real: [] },
    ],
  },
  {
    name: "Campeonato Brasileiro Série D",
    country: "Brasil",
    cup: null,
    clubs: [
      { n: "Manaus FC", city: "Manaus", stadium: "Arena da Amazônia", p: "#003DA5", s: "#FFFFFF", base: 44, real: [] },
      { n: "Trem", city: "Alegrete", stadium: "Estádio Assis Brasil", p: "#000000", s: "#FFFFFF", base: 41, real: [] },
      { n: "Central", city: "Caruaru", stadium: "Luiz Gonzaga de Barros Melo", p: "#FFD700", s: "#000000", base: 41, real: [] },
      { n: "Treze", city: "Campina Grande", stadium: "Presidente Vargas", p: "#C8102E", s: "#000000", base: 43, real: [] },
      { n: "Sousa", city: "Sousa", stadium: "Marizão", p: "#000000", s: "#FFD700", base: 40, real: [] },
      { n: "Barra", city: "Barra do Piraí", stadium: "Waldemar Wanderley", p: "#003DA5", s: "#FFFFFF", base: 40, real: [] },
      { n: "Camboriú", city: "Camboriú", stadium: "Rançoli", p: "#000000", s: "#FFFFFF", base: 40, real: [] },
      { n: "Cianorte", city: "Cianorte", stadium: "Vale do Alecrim", p: "#003DA5", s: "#FFFFFF", base: 41, real: [] },
      { n: "Marília", city: "Marília", stadium: "Bento de Abreu", p: "#003DA5", s: "#FFFFFF", base: 42, real: [] },
      { n: "Rio Branco-AC", city: "Rio Branco", stadium: "Arena da Floresta", p: "#00954C", s: "#FFFFFF", base: 40, real: [] },
      { n: "Costa Rica-MS", city: "Costa Rica", stadium: "Zerão", p: "#000000", s: "#FFD700", base: 39, real: [] },
      { n: "Santa Cruz", city: "Recife", stadium: "Arruda", p: "#C8102E", s: "#000000", base: 44, real: [] },
      { n: "São Raimundo-RR", city: "Boa Vista", stadium: "Canarinho", p: "#003DA5", s: "#FFFFFF", base: 39, real: [] },
      { n: "Porto Velho", city: "Porto Velho", stadium: "Aluízio Ferreira", p: "#003DA5", s: "#FFFFFF", base: 39, real: [] },
      { n: "Juazeirense", city: "Juazeiro", stadium: "Adauto Moraes", p: "#000000", s: "#FFFFFF", base: 40, real: [] },
      { n: "Jacuipense", city: "Riachão do Jacuípe", stadium: "Estádio Estrela do Sertão", p: "#C8102E", s: "#000000", base: 39, real: [] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seleções nacionais — jogam sob a "liga" especial abaixo.
// ---------------------------------------------------------------------------
const NATIONAL_TEAM_LEAGUE = {
  name: "Seleções Internacionais",
  country: "Internacional",
  cup: null,
  clubs: [
    { n: "Brasil", city: "Seleção Nacional", country: "Brasil", stadium: "Maracanã", p: "#FFDF00", s: "#009C3B", base: 90, real: [
      "Alisson|GOL|Brasil|32", "Ederson|GOL|Brasil|31", "Marquinhos|ZAG|Brasil|30", "Éder Militão|ZAG|Brasil|26", "Danilo|LAT|Brasil|33",
      "Wendell|LAT|Brasil|31", "Casemiro|VOL|Brasil|32", "Bruno Guimarães|VOL|Brasil|26", "Lucas Paquetá|MEI|Brasil|27",
      "Vinícius Júnior|ATA|Brasil|24", "Rodrygo|ATA|Brasil|23", "Raphinha|ATA|Brasil|28", "Neymar|ATA|Brasil|33", "Endrick|ATA|Brasil|18" ] },
    { n: "Argentina", city: "Seleção Nacional", country: "Argentina", stadium: "Estadio Monumental", p: "#75AADB", s: "#FFFFFF", base: 90, real: [
      "Emiliano Martínez|GOL|Argentina|32", "Cristian Romero|ZAG|Argentina|26", "Lisandro Martínez|ZAG|Argentina|27", "Nahuel Molina|LAT|Argentina|26",
      "Rodrigo De Paul|VOL|Argentina|30", "Enzo Fernández|MEI|Argentina|24", "Alexis Mac Allister|MEI|Argentina|26", "Lionel Messi|ATA|Argentina|37",
      "Julián Álvarez|ATA|Argentina|24", "Ángel Di María|ATA|Argentina|36", "Lautaro Martínez|ATA|Argentina|27" ] },
    { n: "França", city: "Seleção Nacional", country: "França", stadium: "Stade de France", p: "#0055A4", s: "#EF4135", base: 90, real: [
      "Mike Maignan|GOL|França|29", "William Saliba|ZAG|França|23", "Ibrahima Konaté|ZAG|França|25", "Jules Koundé|LAT|França|26",
      "Theo Hernández|LAT|França|27", "Aurélien Tchouaméni|VOL|França|24", "Adrien Rabiot|VOL|França|29", "Antoine Griezmann|MEI|França|33",
      "Ousmane Dembélé|ATA|França|27", "Kylian Mbappé|ATA|França|26", "Randal Kolo Muani|ATA|França|25" ] },
    { n: "Inglaterra", city: "Seleção Nacional", country: "Inglaterra", stadium: "Wembley Stadium", p: "#FFFFFF", s: "#CE1124", base: 89, real: [
      "Jordan Pickford|GOL|Inglaterra|30", "John Stones|ZAG|Inglaterra|30", "Marc Guéhi|ZAG|Inglaterra|24", "Kyle Walker|LAT|Inglaterra|34",
      "Trent Alexander-Arnold|LAT|Inglaterra|26", "Declan Rice|VOL|Inglaterra|25", "Jude Bellingham|MEI|Inglaterra|21", "Phil Foden|MEI|Inglaterra|24",
      "Bukayo Saka|ATA|Inglaterra|23", "Harry Kane|ATA|Inglaterra|31", "Marcus Rashford|ATA|Inglaterra|27" ] },
    { n: "Espanha", city: "Seleção Nacional", country: "Espanha", stadium: "Santiago Bernabéu", p: "#AA151B", s: "#F1BF00", base: 89, real: [
      "Unai Simón|GOL|Espanha|27", "Robin Le Normand|ZAG|Espanha|27", "Aymeric Laporte|ZAG|Espanha|30", "Dani Carvajal|LAT|Espanha|32",
      "Marc Cucurella|LAT|Espanha|26", "Rodri|VOL|Espanha|28", "Pedri|MEI|Espanha|22", "Fabián Ruiz|MEI|Espanha|28",
      "Lamine Yamal|ATA|Espanha|17", "Nico Williams|ATA|Espanha|22", "Álvaro Morata|ATA|Espanha|32" ] },
    { n: "Alemanha", city: "Seleção Nacional", country: "Alemanha", stadium: "Allianz Arena", p: "#FFFFFF", s: "#000000", base: 87, real: [
      "Manuel Neuer|GOL|Alemanha|38", "Antonio Rüdiger|ZAG|Alemanha|31", "Jonathan Tah|ZAG|Alemanha|28", "Joshua Kimmich|LAT|Alemanha|29",
      "David Raum|LAT|Alemanha|26", "Robert Andrich|VOL|Alemanha|29", "Toni Kroos|MEI|Alemanha|34", "Jamal Musiala|MEI|Alemanha|21",
      "Florian Wirtz|MEI|Alemanha|21", "Kai Havertz|ATA|Alemanha|25", "Leroy Sané|ATA|Alemanha|29" ] },
    { n: "Portugal", city: "Seleção Nacional", country: "Portugal", stadium: "Estádio da Luz", p: "#FF0000", s: "#006600", base: 87, real: [
      "Diogo Costa|GOL|Portugal|25", "Rúben Dias|ZAG|Portugal|27", "António Silva|ZAG|Portugal|20", "Diogo Dalot|LAT|Portugal|25",
      "Nuno Mendes|LAT|Portugal|22", "Vitinha|VOL|Portugal|24", "Bruno Fernandes|MEI|Portugal|30", "Bernardo Silva|MEI|Portugal|30",
      "Cristiano Ronaldo|ATA|Portugal|40", "Rafael Leão|ATA|Portugal|25", "João Félix|ATA|Portugal|25" ] },
    { n: "Itália", city: "Seleção Nacional", country: "Itália", stadium: "Stadio Olímpico", p: "#0066CC", s: "#FFFFFF", base: 82, real: [
      "Gianluigi Donnarumma|GOL|Itália|25", "Alessandro Bastoni|ZAG|Itália|25", "Riccardo Calafiori|ZAG|Itália|22", "Giovanni Di Lorenzo|LAT|Itália|31",
      "Federico Dimarco|LAT|Itália|27", "Nicolò Barella|MEI|Itália|27", "Davide Frattesi|MEI|Itália|25", "Federico Chiesa|ATA|Itália|27",
      "Moise Kean|ATA|Itália|24" ] },
    { n: "Holanda", city: "Seleção Nacional", country: "Holanda", stadium: "Johan Cruyff Arena", p: "#FF6600", s: "#FFFFFF", base: 85, real: [
      "Bart Verbruggen|GOL|Holanda|22", "Virgil van Dijk|ZAG|Holanda|33", "Stefan de Vrij|ZAG|Holanda|32", "Denzel Dumfries|LAT|Holanda|28",
      "Nathan Aké|LAT|Holanda|29", "Frenkie de Jong|VOL|Holanda|27", "Tijjani Reijnders|MEI|Holanda|26", "Xavi Simons|MEI|Holanda|21",
      "Memphis Depay|ATA|Holanda|30", "Cody Gakpo|ATA|Holanda|25" ] },
    { n: "Bélgica", city: "Seleção Nacional", country: "Bélgica", stadium: "Estádio Rei Balduíno", p: "#000000", s: "#FDDA24", base: 83, real: [
      "Koen Casteels|GOL|Bélgica|32", "Wout Faes|ZAG|Bélgica|26", "Jan Vertonghen|ZAG|Bélgica|37", "Jeremy Doku|ATA|Bélgica|22",
      "Kevin De Bruyne|MEI|Bélgica|33", "Romelu Lukaku|ATA|Bélgica|31", "Youri Tielemans|MEI|Bélgica|27" ] },
    { n: "Croácia", city: "Seleção Nacional", country: "Croácia", stadium: "Estádio Maksimir", p: "#FF0000", s: "#FFFFFF", base: 83, real: [
      "Dominik Livaković|GOL|Croácia|29", "Josip Šutalo|ZAG|Croácia|22", "Joško Gvardiol|ZAG|Croácia|23", "Luka Modrić|MEI|Croácia|39",
      "Mateo Kovačić|MEI|Croácia|30", "Marcelo Brozović|VOL|Croácia|31", "Ivan Perišić|ATA|Croácia|35" ] },
    { n: "Uruguai", city: "Seleção Nacional", country: "Uruguai", stadium: "Estádio Centenário", p: "#5CB3FF", s: "#000000", base: 83, real: [
      "Sergio Rochet|GOL|Uruguai|29", "José María Giménez|ZAG|Uruguai|29", "Ronald Araújo|ZAG|Uruguai|25", "Federico Valverde|MEI|Uruguai|26",
      "Rodrigo Bentancur|VOL|Uruguai|27", "Darwin Núñez|ATA|Uruguai|25", "Facundo Pellistri|ATA|Uruguai|22" ] },
    { n: "Colômbia", city: "Seleção Nacional", country: "Colômbia", stadium: "Estádio Metropolitano", p: "#FCD116", s: "#003893", base: 81, real: [
      "Camilo Vargas|GOL|Colômbia|33", "Davinson Sánchez|ZAG|Colômbia|28", "Jefferson Lerma|VOL|Colômbia|29", "James Rodríguez|MEI|Colômbia|33",
      "Luis Díaz|ATA|Colômbia|27", "Rafael Santos Borré|ATA|Colômbia|29" ] },
    { n: "México", city: "Seleção Nacional", country: "México", stadium: "Estádio Azteca", p: "#006847", s: "#CE1126", base: 78, real: [
      "Guillermo Ochoa|GOL|México|38", "Julián Araujo|LAT|México|23", "Edson Álvarez|VOL|México|26", "Hirving Lozano|ATA|México|29",
      "Santiago Giménez|ATA|México|23" ] },
    { n: "Estados Unidos", city: "Seleção Nacional", country: "Estados Unidos", stadium: "Estádio Azteca", p: "#B22234", s: "#3C3B6E", base: 78, real: [
      "Matt Turner|GOL|Estados Unidos|30", "Tim Ream|ZAG|Estados Unidos|37", "Antonee Robinson|LAT|Estados Unidos|27", "Weston McKennie|VOL|Estados Unidos|26",
      "Tyler Adams|VOL|Estados Unidos|25", "Christian Pulisic|ATA|Estados Unidos|26", "Folarin Balogun|ATA|Estados Unidos|23" ] },
    { n: "Marrocos", city: "Seleção Nacional", country: "Marrocos", stadium: "Estádio Mohammed V", p: "#C1272D", s: "#006233", base: 82, real: [
      "Yassine Bounou|GOL|Marrocos|33", "Achraf Hakimi|LAT|Marrocos|25", "Nayef Aguerd|ZAG|Marrocos|28", "Sofyan Amrabat|VOL|Marrocos|28",
      "Hakim Ziyech|MEI|Marrocos|31", "Youssef En-Nesyri|ATA|Marrocos|27" ] },
    { n: "Senegal", city: "Seleção Nacional", country: "Senegal", stadium: "Estádio Abdoulaye Wade", p: "#00853F", s: "#FDEF42", base: 81, real: [
      "Édouard Mendy|GOL|Senegal|32", "Kalidou Koulibaly|ZAG|Senegal|33", "Ismaïla Sarr|ATA|Senegal|26", "Sadio Mané|ATA|Senegal|32" ] },
    { n: "Nigéria", city: "Seleção Nacional", country: "Nigéria", stadium: "Estádio Moshood Abiola", p: "#008751", s: "#FFFFFF", base: 79, real: [
      "Stanley Nwabali|GOL|Nigéria|28", "William Troost-Ekong|ZAG|Nigéria|31", "Calvin Bassey|ZAG|Nigéria|24", "Wilfred Ndidi|VOL|Nigéria|27",
      "Victor Osimhen|ATA|Nigéria|25", "Ademola Lookman|ATA|Nigéria|26" ] },
    { n: "Gana", city: "Seleção Nacional", country: "Gana", stadium: "Estádio Baba Yara", p: "#CE1126", s: "#FCD116", base: 76, real: [
      "Lawrence Ati-Zigi|GOL|Gana|28", "Mohammed Salisu|ZAG|Gana|25", "Thomas Partey|VOL|Gana|31", "Mohammed Kudus|ATA|Gana|24", "Jordan Ayew|ATA|Gana|32" ] },
    { n: "Japão", city: "Seleção Nacional", country: "Japão", stadium: "Estádio Nacional do Japão", p: "#BC002D", s: "#FFFFFF", base: 79, real: [
      "Zion Suzuki|GOL|Japão|22", "Takehiro Tomiyasu|ZAG|Japão|25", "Kaoru Mitoma|ATA|Japão|27", "Takefusa Kubo|ATA|Japão|23", "Daichi Kamada|MEI|Japão|28" ] },
    { n: "Coreia do Sul", city: "Seleção Nacional", country: "Coreia do Sul", stadium: "Estádio Mundialista de Seul", p: "#CD2E3A", s: "#0047A0", base: 78, real: [
      "Kim Seung-gyu|GOL|Coreia do Sul|32", "Kim Min-jae|ZAG|Coreia do Sul|27", "Lee Kang-in|MEI|Coreia do Sul|23", "Son Heung-min|ATA|Coreia do Sul|32" ] },
    { n: "Austrália", city: "Seleção Nacional", country: "Austrália", stadium: "Stadium Australia", p: "#FFD700", s: "#00843D", base: 74, real: [
      "Mathew Ryan|GOL|Austrália|32", "Harry Souttar|ZAG|Austrália|25", "Aaron Mooy|VOL|Austrália|33", "Mathew Leckie|ATA|Austrália|33" ] },
    { n: "Canadá", city: "Seleção Nacional", country: "Canadá", stadium: "BMO Field", p: "#FF0000", s: "#FFFFFF", base: 75, real: [
      "Maxime Crépeau|GOL|Canadá|30", "Alphonso Davies|LAT|Canadá|24", "Stephen Eustáquio|VOL|Canadá|27", "Jonathan David|ATA|Canadá|24" ] },
    { n: "Dinamarca", city: "Seleção Nacional", country: "Dinamarca", stadium: "Parken Stadium", p: "#C60C30", s: "#FFFFFF", base: 79, real: [
      "Kasper Schmeichel|GOL|Dinamarca|37", "Andreas Christensen|ZAG|Dinamarca|28", "Joachim Andersen|ZAG|Dinamarca|28",
      "Pierre-Emile Højbjerg|VOL|Dinamarca|29", "Christian Eriksen|MEI|Dinamarca|32", "Rasmus Højlund|ATA|Dinamarca|21" ] },
  ],
};

module.exports = { LEAGUE_DEFS, NATIONAL_TEAM_LEAGUE };
