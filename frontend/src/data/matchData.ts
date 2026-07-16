export const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'pt', name: 'Portuguese' }, { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' }, { code: 'it', name: 'Italian' }, { code: 'ru', name: 'Russian' },
];

export const MATCH_CONFIG = {
  match: { home_team: 'Spain', away_team: 'Argentina', date: '2026-07-19', time: '19:00', stage: 'Final', venue: 'MetLife Stadium' }
};

export const STADIUMS = [
  {id:'atlanta',name:'Mercedes-Benz Stadium',lat:33.7554,lng:-84.401,city:'Atlanta',country:'USA'},
  {id:'boston',name:'Gillette Stadium',lat:42.0909,lng:-71.2643,city:'Boston',country:'USA'},
  {id:'dallas',name:'AT&T Stadium',lat:32.7473,lng:-97.0945,city:'Dallas',country:'USA'},
  {id:'houston',name:'NRG Stadium',lat:29.6847,lng:-95.4107,city:'Houston',country:'USA'},
  {id:'kansas-city',name:'Arrowhead Stadium',lat:39.0489,lng:-94.4839,city:'Kansas City',country:'USA'},
  {id:'los-angeles',name:'SoFi Stadium',lat:33.9534,lng:-118.3391,city:'Los Angeles',country:'USA'},
  {id:'miami',name:'Hard Rock Stadium',lat:25.958,lng:-80.2389,city:'Miami',country:'USA'},
  {id:'new-york',name:'MetLife Stadium',lat:40.8128,lng:-74.0742,city:'New York/New Jersey',country:'USA'},
  {id:'philadelphia',name:'Lincoln Financial Field',lat:39.9008,lng:-75.1675,city:'Philadelphia',country:'USA'},
  {id:'san-francisco',name:"Levi's Stadium",lat:37.4033,lng:-121.9694,city:'San Francisco Bay Area',country:'USA'},
  {id:'seattle',name:'Lumen Field',lat:47.5952,lng:-122.3316,city:'Seattle',country:'USA'},
  {id:'mexico-city',name:'Estadio Azteca',lat:19.3029,lng:-99.1505,city:'Mexico City',country:'Mexico'},
  {id:'guadalajara',name:'Estadio Akron',lat:20.682,lng:-103.4625,city:'Guadalajara',country:'Mexico'},
  {id:'monterrey',name:'Estadio BBVA',lat:25.67,lng:-100.2444,city:'Monterrey',country:'Mexico'},
  {id:'toronto',name:'BMO Field',lat:43.6332,lng:-79.4186,city:'Toronto',country:'Canada'},
  {id:'vancouver',name:'BC Place',lat:49.2768,lng:-123.1107,city:'Vancouver',country:'Canada'},
];

export const FALLBACK_STANDINGS = [
  {group:'A',teams:[{name:'Mexico',pts:9,gd:6},{name:'South Africa',pts:4,gd:-1},{name:'South Korea',pts:3,gd:-1},{name:'Czechia',pts:1,gd:-4}]},
  {group:'B',teams:[{name:'Switzerland',pts:7,gd:4},{name:'Canada',pts:4,gd:5},{name:'Bosnia & Herzegovina',pts:4,gd:-1},{name:'Qatar',pts:1,gd:-8}]},
  {group:'C',teams:[{name:'Brazil',pts:7,gd:6},{name:'Morocco',pts:7,gd:3},{name:'Scotland',pts:3,gd:-3},{name:'Haiti',pts:0,gd:-6}]},
  {group:'D',teams:[{name:'USA',pts:6,gd:4},{name:'Australia',pts:4,gd:0},{name:'Paraguay',pts:4,gd:-2},{name:'Turkiye',pts:3,gd:-2}]},
  {group:'E',teams:[{name:'Germany',pts:6,gd:6},{name:'Ivory Coast',pts:6,gd:2},{name:'Ecuador',pts:4,gd:0},{name:'Curacao',pts:1,gd:-8}]},
  {group:'F',teams:[{name:'Netherlands',pts:7,gd:6},{name:'Japan',pts:5,gd:4},{name:'Sweden',pts:4,gd:0},{name:'Tunisia',pts:0,gd:-10}]},
  {group:'G',teams:[{name:'Belgium',pts:5,gd:3},{name:'Egypt',pts:5,gd:2},{name:'Iran',pts:3,gd:0},{name:'New Zealand',pts:1,gd:-5}]},
  {group:'H',teams:[{name:'Spain',pts:7,gd:5},{name:'Cape Verde',pts:3,gd:0},{name:'Uruguay',pts:2,gd:-1},{name:'Saudi Arabia',pts:1,gd:-4}]},
  {group:'I',teams:[{name:'France',pts:9,gd:8},{name:'Norway',pts:6,gd:1},{name:'Senegal',pts:0,gd:-3},{name:'Iraq',pts:0,gd:-6}]},
  {group:'J',teams:[{name:'Argentina',pts:9,gd:7},{name:'Austria',pts:4,gd:0},{name:'Algeria',pts:4,gd:-2},{name:'Jordan',pts:0,gd:-5}]},
  {group:'K',teams:[{name:'Colombia',pts:6,gd:3},{name:'Portugal',pts:4,gd:5},{name:'DR Congo',pts:4,gd:1},{name:'Uzbekistan',pts:0,gd:-7}]},
  {group:'L',teams:[{name:'England',pts:7,gd:4},{name:'Croatia',pts:6,gd:0},{name:'Ghana',pts:4,gd:0},{name:'Panama',pts:0,gd:-4}]},
];

export const KNOCKOUT_BRACKET = [
  { round: 'Round of 32', matches: [
    { home: 'South Africa', away: 'Canada', homeScore: 0, awayScore: 1 },
    { home: 'Brazil', away: 'Japan', homeScore: 2, awayScore: 1 },
    { home: 'Germany', away: 'Paraguay', homeScore: 1, awayScore: 1 },
    { home: 'Netherlands', away: 'Morocco', homeScore: 1, awayScore: 1 },
    { home: 'Ivory Coast', away: 'Norway', homeScore: 1, awayScore: 2 },
    { home: 'France', away: 'Sweden', homeScore: 3, awayScore: 0 },
    { home: 'Mexico', away: 'Ecuador', homeScore: 2, awayScore: 0 },
    { home: 'England', away: 'DR Congo', homeScore: 2, awayScore: 1 },
    { home: 'Belgium', away: 'Senegal', homeScore: 3, awayScore: 2 },
    { home: 'USA', away: 'Bosnia & Herzegovina', homeScore: 2, awayScore: 0 },
    { home: 'Spain', away: 'Austria', homeScore: 3, awayScore: 0 },
    { home: 'Portugal', away: 'Croatia', homeScore: 2, awayScore: 1 },
    { home: 'Switzerland', away: 'Algeria', homeScore: 2, awayScore: 0 },
    { home: 'Egypt', away: 'Australia', homeScore: 1, awayScore: 1 },
    { home: 'Argentina', away: 'Cape Verde', homeScore: 3, awayScore: 2 },
    { home: 'Colombia', away: 'Ghana', homeScore: 1, awayScore: 0 },
  ]},
  { round: 'Round of 16', matches: [
    { home: 'Canada', away: 'Morocco', homeScore: 0, awayScore: 3 },
    { home: 'Paraguay', away: 'France', homeScore: 0, awayScore: 1 },
    { home: 'Brazil', away: 'Norway', homeScore: 1, awayScore: 2 },
    { home: 'Mexico', away: 'England', homeScore: 2, awayScore: 3 },
    { home: 'USA', away: 'Belgium', homeScore: 1, awayScore: 4 },
    { home: 'Spain', away: 'Portugal', homeScore: 1, awayScore: 0 },
    { home: 'Switzerland', away: 'Colombia', homeScore: 1, awayScore: 1 },
    { home: 'Argentina', away: 'Egypt', homeScore: 3, awayScore: 2 },
  ]},
  { round: 'Quarter-Finals', matches: [
    { home: 'Morocco', away: 'France', homeScore: 0, awayScore: 2 },
    { home: 'Spain', away: 'Belgium', homeScore: 2, awayScore: 1 },
    { home: 'Norway', away: 'England', homeScore: 1, awayScore: 2 },
    { home: 'Argentina', away: 'Switzerland', homeScore: 3, awayScore: 1 },
  ]},
  { round: 'Semi-Finals', matches: [
    { home: 'France', away: 'Spain', homeScore: 0, awayScore: 2 },
    { home: 'England', away: 'Argentina', homeScore: 1, awayScore: 2 },
  ]},
];

export const STADIUM_METADATA: Record<string, any> = {
  'new-york': {
    name: 'MetLife Stadium', capacity: 82500, gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    amenities: {
      restrooms: { lower: [105, 120, 135, 145, 155], upper: [210, 225, 240, 255] },
      food: [{ name: 'Big Apple Bistro', section_near: 105, cuisine: 'American' }, { name: 'Pearl River Chinese', section_near: 125, cuisine: 'Chinese' }],
      atm: [110, 140, 220, 250, 320], first_aid: [108, 130, 220, 330]
    }
  },
  atlanta: {
    name: 'Mercedes-Benz Stadium', capacity: 71000, gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    amenities: { restrooms: { lower: [105, 120, 135], upper: [210, 225, 240] }, food: [{ name: 'Great American Grill', section_near: 110, cuisine: 'American' }], atm: [110, 135, 210, 240], first_aid: [108, 220] }
  }
};
