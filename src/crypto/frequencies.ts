/**
 * CipherMind AI - English Frequency Distributions & Dictionary
 */

// Standard English letter frequencies (percentage 0 - 100)
export const ENGLISH_LETTER_FREQUENCIES: Record<string, number> = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702,
  F: 2.228, G: 2.015, H: 6.094, I: 6.966, J: 0.153,
  K: 0.772, L: 4.025, M: 2.406, N: 6.749, O: 7.507,
  P: 1.929, Q: 0.095, R: 5.987, S: 6.327, T: 9.056,
  U: 2.758, V: 0.978, W: 2.360, X: 0.150, Y: 1.974, Z: 0.074,
};

// Spanish letter frequencies
export const SPANISH_LETTER_FREQUENCIES: Record<string, number> = {
  A: 12.53, B: 1.42, C: 4.68, D: 5.86, E: 13.68,
  F: 0.69, G: 1.01, H: 0.70, I: 6.25, J: 0.44,
  K: 0.02, L: 4.97, M: 3.15, N: 6.71, O: 8.68,
  P: 2.51, Q: 0.88, R: 6.87, S: 7.98, T: 4.63,
  U: 3.93, V: 0.90, W: 0.01, X: 0.22, Y: 0.90, Z: 0.52,
};

// French letter frequencies
export const FRENCH_LETTER_FREQUENCIES: Record<string, number> = {
  A: 7.636, B: 0.901, C: 3.260, D: 3.669, E: 14.715,
  F: 1.066, G: 0.866, H: 0.737, I: 7.529, J: 0.613,
  K: 0.074, L: 5.456, M: 2.968, N: 7.095, O: 5.796,
  P: 2.521, Q: 1.362, R: 6.693, S: 7.948, T: 7.244,
  U: 6.311, V: 1.838, W: 0.049, X: 0.427, Y: 0.128, Z: 0.326,
};

// German letter frequencies
export const GERMAN_LETTER_FREQUENCIES: Record<string, number> = {
  A: 6.516, B: 1.886, C: 2.732, D: 5.076, E: 17.404,
  F: 1.656, G: 3.010, H: 4.577, I: 7.550, J: 0.268,
  K: 1.210, L: 3.437, M: 2.534, N: 9.776, O: 2.507,
  P: 0.789, Q: 0.018, R: 7.003, S: 7.270, T: 6.154,
  U: 4.351, V: 0.670, W: 1.890, X: 0.034, Y: 0.042, Z: 1.134,
};

// Italian letter frequencies
export const ITALIAN_LETTER_FREQUENCIES: Record<string, number> = {
  A: 11.74, B: 0.92, C: 4.50, D: 3.73, E: 11.79,
  F: 1.15, G: 1.64, H: 0.64, I: 11.28, J: 0.01,
  K: 0.01, L: 6.51, M: 2.51, N: 6.88, O: 9.83,
  P: 3.05, Q: 0.51, R: 6.37, S: 4.98, T: 5.62,
  U: 3.01, V: 2.10, W: 0.01, X: 0.01, Y: 0.02, Z: 1.18,
};

// Latin letter frequencies
export const LATIN_LETTER_FREQUENCIES: Record<string, number> = {
  A: 8.13, B: 1.50, C: 4.10, D: 3.20, E: 11.20,
  F: 1.00, G: 1.40, H: 0.80, I: 10.60, J: 0.10,
  K: 0.01, L: 3.80, M: 5.60, N: 6.10, O: 5.90,
  P: 3.10, Q: 1.50, R: 6.80, S: 7.30, T: 9.20,
  U: 8.30, V: 1.20, W: 0.01, X: 0.70, Y: 0.10, Z: 0.05,
};

export const LANGUAGE_FREQUENCIES: Record<string, Record<string, number>> = {
  en: ENGLISH_LETTER_FREQUENCIES,
  es: SPANISH_LETTER_FREQUENCIES,
  fr: FRENCH_LETTER_FREQUENCIES,
  de: GERMAN_LETTER_FREQUENCIES,
  it: ITALIAN_LETTER_FREQUENCIES,
  la: LATIN_LETTER_FREQUENCIES,
};

export function getLanguageFrequencies(lang = 'en'): Record<string, number> {
  return LANGUAGE_FREQUENCIES[lang] || ENGLISH_LETTER_FREQUENCIES;
}

export function getExpectedIoC(lang = 'en'): number {
  switch (lang) {
    case 'es': return 0.0770;
    case 'fr': return 0.0778;
    case 'de': return 0.0762;
    case 'it': return 0.0738;
    case 'la': return 0.0720;
    default: return 0.0667;
  }
}

// Theoretical Index of Coincidence for standard English text is ~0.0667
export const ENGLISH_IOC = 0.0667;
// Random uniform text (26 letters) IoC is 1/26 ~ 0.0385
export const RANDOM_IOC = 0.0385;

// Top English Bigrams with weights
export const COMMON_BIGRAMS = new Set([
  'TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ON', 'AT', 'EN', 'ND',
  'ED', 'ES', 'OR', 'TE', 'OF', 'ST', 'IT', 'TO', 'NT', 'IS',
  'AR', 'OU', 'TI', 'AS', 'HA', 'NG', 'CO', 'SE', 'ME', 'DE',
]);

// Top English Trigrams
export const COMMON_TRIGRAMS = new Set([
  'THE', 'AND', 'THA', 'ENT', 'ING', 'ION', 'NDE', 'HAS', 'NCE', 'TIS',
  'OFT', 'MEN', 'FOR', 'OUR', 'NOT', 'ALL', 'WAS', 'ONE', 'HAD', 'BUT',
]);

// Comprehensive English words corpus for fast deterministic candidate validation
const WORD_LIST = [
  // 1-3 letters
  'a', 'an', 'at', 'as', 'be', 'by', 'do', 'go', 'he', 'hi', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
  'act', 'add', 'age', 'ago', 'air', 'all', 'and', 'any', 'are', 'arm', 'art', 'ask', 'bad', 'bag', 'bar', 'bed', 'big', 'bit', 'box', 'boy', 'bus',
  'but', 'buy', 'can', 'car', 'cat', 'cup', 'cut', 'day', 'did', 'die', 'dog', 'dry', 'due', 'ear', 'eat', 'egg', 'end', 'eye', 'far', 'few', 'fit',
  'fly', 'for', 'fun', 'gas', 'get', 'god', 'got', 'gun', 'guy', 'had', 'has', 'hat', 'her', 'him', 'his', 'hit', 'hot', 'how', 'ice', 'ill', 'its',
  'job', 'key', 'kid', 'law', 'lay', 'leg', 'let', 'lie', 'lip', 'low', 'man', 'map', 'may', 'men', 'met', 'mix', 'mom', 'new', 'nor', 'not', 'now',
  'off', 'oil', 'old', 'one', 'our', 'out', 'own', 'pan', 'pay', 'per', 'pet', 'pie', 'pin', 'pit', 'put', 'raw', 'red', 'rid', 'run', 'sad', 'sat',
  'saw', 'say', 'sea', 'see', 'set', 'she', 'sir', 'sit', 'six', 'sky', 'son', 'spy', 'sun', 'tax', 'tea', 'ten', 'the', 'tie', 'tip', 'too', 'top',
  'try', 'two', 'use', 'van', 'via', 'war', 'was', 'way', 'who', 'why', 'win', 'yes', 'yet', 'you',

  // 4 letters
  'able', 'acid', 'aged', 'ally', 'also', 'area', 'army', 'away', 'baby', 'back', 'ball', 'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been',
  'beer', 'bell', 'belt', 'best', 'bill', 'bird', 'blow', 'blue', 'boat', 'body', 'bomb', 'bond', 'bone', 'book', 'boom', 'born', 'boss', 'both',
  'bowl', 'bulk', 'burn', 'bush', 'busy', 'call', 'calm', 'came', 'camp', 'card', 'care', 'case', 'cash', 'cast', 'cell', 'chat', 'chip', 'city',
  'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool', 'cope', 'copy', 'core', 'cost', 'crew', 'crop', 'dark', 'data', 'date', 'dawn',
  'dead', 'deal', 'dear', 'debt', 'deep', 'deny', 'desk', 'dial', 'diet', 'disc', 'disk', 'does', 'done', 'door', 'dose', 'down', 'draw', 'drop',
  'drug', 'dual', 'duke', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy', 'edge', 'edit', 'else', 'even', 'ever', 'evil', 'exit', 'face',
  'fact', 'fade', 'fail', 'fair', 'fall', 'farm', 'fast', 'fate', 'fear', 'feed', 'feel', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm',
  'fish', 'five', 'flat', 'flow', 'food', 'foot', 'ford', 'form', 'fort', 'four', 'free', 'from', 'fuel', 'full', 'fund', 'gain', 'game', 'gate',
  'gave', 'gear', 'gene', 'gift', 'girl', 'give', 'glad', 'goal', 'goes', 'gold', 'golf', 'gone', 'good', 'gray', 'grew', 'grey', 'grow', 'gulf',
  'hair', 'half', 'hall', 'hand', 'hang', 'hard', 'harm', 'hate', 'have', 'head', 'hear', 'heat', 'held', 'hell', 'help', 'here', 'hero', 'hide',
  'high', 'hill', 'hire', 'hold', 'hole', 'holy', 'home', 'hope', 'host', 'hour', 'huge', 'hung', 'hunt', 'hurt', 'idea', 'inch', 'into', 'iron',
  'item', 'jack', 'jane', 'join', 'jump', 'jury', 'just', 'keen', 'keep', 'kept', 'kick', 'kill', 'kind', 'king', 'knee', 'knew', 'know', 'lack',
  'lady', 'laid', 'lake', 'land', 'lane', 'last', 'late', 'lead', 'left', 'less', 'life', 'lift', 'like', 'line', 'link', 'list', 'live', 'load',
  'loan', 'lock', 'logo', 'long', 'look', 'lord', 'lose', 'loss', 'lost', 'love', 'luck', 'made', 'mail', 'main', 'make', 'male', 'many', 'mark',
  'mass', 'mate', 'meal', 'mean', 'meat', 'meet', 'menu', 'mere', 'mike', 'mile', 'milk', 'mill', 'mind', 'mine', 'miss', 'mode', 'mood', 'moon',
  'more', 'most', 'move', 'much', 'must', 'name', 'navy', 'near', 'neck', 'need', 'news', 'next', 'nice', 'nick', 'nine', 'none', 'nose', 'note',
  'okay', 'once', 'only', 'onto', 'open', 'oral', 'over', 'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'palm', 'park', 'part', 'pass', 'past',
  'path', 'peak', 'peer', 'pick', 'pile', 'pipe', 'plan', 'play', 'plot', 'plug', 'plus', 'poll', 'pool', 'poor', 'port', 'post', 'pull', 'pure',
  'push', 'race', 'rail', 'rain', 'rank', 'rare', 'rate', 'read', 'real', 'rear', 'rely', 'rent', 'rest', 'rice', 'rich', 'ride', 'ring', 'rise',
  'risk', 'road', 'rock', 'role', 'roll', 'roof', 'room', 'root', 'rose', 'rule', 'rush', 'safe', 'said', 'sake', 'sale', 'salt', 'same', 'sand',
  'save', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'send', 'sent', 'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sign',
  'site', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'sort', 'soul', 'spot', 'star', 'stay',
  'step', 'stop', 'such', 'suit', 'sure', 'take', 'tale', 'talk', 'tall', 'tank', 'tape', 'task', 'team', 'tech', 'tell', 'tend', 'term', 'test',
  'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this', 'thou', 'thus', 'tide', 'time', 'tiny', 'told', 'toll', 'tone', 'tony', 'took',
  'tool', 'tour', 'town', 'tree', 'trip', 'true', 'tune', 'turn', 'twin', 'type', 'unit', 'upon', 'used', 'user', 'vary', 'vast', 'very', 'vice',
  'view', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall', 'want', 'ward', 'warm', 'warn', 'wash', 'wave', 'ways', 'weak', 'wear', 'week', 'well',
  'went', 'were', 'west', 'what', 'when', 'whom', 'wide', 'wife', 'wild', 'will', 'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'with', 'wood',
  'word', 'work', 'yard', 'yeah', 'year', 'your', 'zero', 'zone',

  // 5 letters
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert',
  'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise',
  'array', 'aside', 'asset', 'audio', 'audit', 'avoid', 'award', 'aware', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'began', 'begin',
  'begun', 'being', 'below', 'bench', 'billy', 'birth', 'black', 'blame', 'blind', 'block', 'blood', 'board', 'boost', 'booth', 'bound', 'brain',
  'brand', 'bread', 'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'calif', 'carry', 'catch',
  'cause', 'chain', 'chair', 'chart', 'chase', 'cheap', 'check', 'chest', 'chief', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean',
  'clear', 'click', 'clock', 'close', 'coach', 'coast', 'could', 'count', 'court', 'cover', 'craft', 'crash', 'cream', 'crime', 'cross', 'crowd',
  'crown', 'curve', 'cycle', 'daily', 'dance', 'dated', 'death', 'debut', 'delay', 'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drawn',
  'dream', 'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elite', 'empty', 'enemy', 'enjoy', 'enter',
  'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight',
  'final', 'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud',
  'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'great',
  'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harry', 'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel',
  'house', 'human', 'ideal', 'image', 'imply', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones', 'judge', 'known', 'label',
  'labor', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'level', 'lewis', 'light', 'limit', 'links',
  'lives', 'local', 'logic', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'maria', 'match', 'maybe', 'mayor',
  'meant', 'media', 'metal', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie',
  'music', 'needs', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'other',
  'ought', 'paint', 'panel', 'paper', 'party', 'peace', 'peter', 'phase', 'phone', 'photo', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane',
  'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen',
  'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'refer', 'right', 'rival', 'river', 'robin', 'roger',
  'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall', 'shape', 'share',
  'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shirt', 'shock', 'shoot', 'short', 'shown', 'sight', 'since', 'sixth', 'sixty', 'sized', 'skill',
  'sleep', 'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed',
  'spend', 'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel', 'stick', 'still', 'stock',
  'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'table', 'taken',
  'taste', 'taxes', 'teach', 'teeth', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thing', 'think', 'third',
  'those', 'three', 'threw', 'throw', 'tight', 'times', 'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade',
  'train', 'treat', 'trend', 'trial', 'tried', 'tries', 'truck', 'truly', 'trust', 'truth', 'twice', 'under', 'undue', 'union', 'unity', 'until',
  'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit', 'vital', 'voice', 'waste', 'watch', 'water', 'wheel',
  'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'write',
  'wrong', 'wrote', 'yield', 'young', 'youth',

  // 6+ letters & cryptography / military / message themes
  'action', 'active', 'actual', 'advice', 'affect', 'agency', 'almost', 'always', 'amount', 'animal', 'annual', 'answer', 'anyone', 'appear',
  'around', 'arrive', 'artist', 'aspect', 'assess', 'assist', 'assume', 'attack', 'attend', 'author', 'battle', 'become', 'before', 'behind',
  'belief', 'belong', 'better', 'beyond', 'border', 'borrow', 'bother', 'bottle', 'bottom', 'branch', 'bridge', 'bright', 'broken', 'budget',
  'burden', 'bureau', 'button', 'camera', 'cancer', 'canvas', 'carbon', 'career', 'careful', 'castle', 'casual', 'caught', 'center', 'centre',
  'chance', 'change', 'charge', 'choice', 'choose', 'church', 'circle', 'client', 'closed', 'closer', 'coffee', 'column', 'combat', 'common',
  'comply', 'copper', 'corner', 'county', 'couple', 'course', 'cousin', 'create', 'credit', 'crisis', 'custom', 'damage', 'danger', 'dealer',
  'debate', 'decade', 'decide', 'defeat', 'defend', 'define', 'degree', 'demand', 'depend', 'deputy', 'desert', 'design', 'desire', 'detail',
  'detect', 'device', 'differ', 'dinner', 'direct', 'doctor', 'dollar', 'domain', 'double', 'driven', 'driver', 'during', 'easily', 'eating',
  'editor', 'effect', 'effort', 'eighth', 'either', 'eleven', 'emerge', 'empire', 'employ', 'enable', 'ending', 'energy', 'engage', 'engine',
  'enough', 'ensure', 'entire', 'entity', 'equity', 'escape', 'estate', 'ethnic', 'exceed', 'except', 'excess', 'expand', 'expect', 'expert',
  'export', 'extend', 'extent', 'fabric', 'factor', 'failed', 'fairly', 'family', 'famous', 'father', 'fellow', 'female', 'figure', 'filing',
  'finger', 'finish', 'fiscal', 'flight', 'flying', 'follow', 'forced', 'forest', 'forget', 'formal', 'format', 'former', 'foster', 'fought',
  'fourth', 'freely', 'friend', 'future', 'garden', 'gather', 'gender', 'german', 'global', 'golden', 'ground', 'growth', 'guilty', 'handle',
  'happen', 'hardly', 'headed', 'health', 'height', 'hidden', 'holder', 'honest', 'impact', 'import', 'income', 'indeed', 'inform', 'injury',
  'inside', 'intend', 'intent', 'invest', 'island', 'itself', 'jersey', 'joseph', 'junior', 'killed', 'labour', 'latest', 'latter', 'launch',
  'lawyer', 'leader', 'league', 'leaves', 'legacy', 'length', 'lesson', 'letter', 'lights', 'likely', 'linked', 'liquid', 'listen', 'little',
  'living', 'locate', 'london', 'lookup', 'losing', 'lucent', 'luxury', 'mainly', 'making', 'manage', 'manner', 'manual', 'margin', 'marine',
  'marked', 'market', 'martin', 'master', 'matter', 'mature', 'medium', 'member', 'memory', 'mental', 'merely', 'merger', 'method', 'middle',
  'miller', 'mining', 'minute', 'mirror', 'mobile', 'modern', 'modest', 'module', 'moment', 'morris', 'mostly', 'mother', 'motion', 'moving',
  'murder', 'museum', 'mutual', 'myself', 'narrow', 'nation', 'native', 'nature', 'nearby', 'nearly', 'nights', 'nobody', 'normal', 'notice',
  'notion', 'number', 'object', 'obtain', 'office', 'offset', 'online', 'option', 'orange', 'origin', 'output', 'oxford', 'packed', 'palace',
  'parent', 'partly', 'patent', 'people', 'period', 'permit', 'person', 'phrase', 'picked', 'planet', 'player', 'please', 'plenty', 'pocket',
  'police', 'policy', 'prefer', 'pretty', 'prince', 'prison', 'profit', 'proper', 'proven', 'public', 'pursue', 'raised', 'random', 'rarely',
  'rather', 'rating', 'reader', 'really', 'reason', 'recall', 'recent', 'record', 'reduce', 'reform', 'regard', 'regime', 'region', 'relate',
  'relief', 'remain', 'remote', 'remove', 'repair', 'repeat', 'replay', 'report', 'rescue', 'resort', 'result', 'retail', 'retain', 'return',
  'reveal', 'review', 'reward', 'riding', 'rising', 'robust', 'ruling', 'safety', 'salary', 'sample', 'saving', 'saying', 'scheme', 'school',
  'screen', 'search', 'season', 'second', 'secret', 'sector', 'secure', 'seeing', 'select', 'seller', 'senior', 'series', 'server', 'settle',
  'severe', 'sexual', 'should', 'signal', 'signed', 'silent', 'silver', 'simple', 'simply', 'single', 'sister', 'slight', 'smooth', 'social',
  'solely', 'sought', 'source', 'soviet', 'speech', 'spirit', 'spoken', 'spread', 'spring', 'square', 'stable', 'status', 'steady', 'stolen',
  'strain', 'stream', 'street', 'stress', 'strict', 'strike', 'string', 'strong', 'struck', 'studio', 'submit', 'sudden', 'suffer', 'summer',
  'summit', 'supply', 'surely', 'survey', 'switch', 'symbol', 'system', 'taking', 'talent', 'target', 'taught', 'tenant', 'tender', 'tennis',
  'thanks', 'theory', 'thirty', 'threat', 'ticket', 'timely', 'timing', 'tissue', 'toward', 'travel', 'treaty', 'trying', 'twelve', 'twenty',
  'unable', 'unique', 'united', 'unless', 'unlike', 'update', 'useful', 'valley', 'varied', 'vendor', 'versus', 'victim', 'vision', 'visual',
  'volume', 'walker', 'wealth', 'weekly', 'weight', 'wholly', 'window', 'winner', 'winter', 'wisdom', 'within', 'wonder', 'worker', 'wright',
  'writer', 'yellow',

  // Cryptography, Military, Puzzle, Classical Themes
  'fox', 'jump', 'jumps', 'jumped', 'lazy', 'curiosity', 'curious', 'noble', 'noblest', 'pursuit', 'pursuits',
  'foundation', 'progress', 'liberty', 'physics', 'quantum', 'alexandria', 'astronomy', 'astronomical',
  'observatory', 'dusk', 'scholarship', 'archives', 'expedition', 'safely', 'mountain', 'summit', 'inquiry',
  'philosophy', 'wonder', 'celestial', 'stars', 'sunrise', 'sunset', 'nature', 'universe', 'scrolls', 'letters',
  'cipher', 'crypto', 'decode', 'decrypt', 'encrypt', 'message', 'secret', 'operation', 'general', 'captain', 'colonel', 'admiral',
  'officer', 'soldier', 'troops', 'strike', 'mission', 'dawn', 'midnight', 'noon', 'tomorrow', 'yesterday', 'intercept', 'station',
  'rendezvous', 'reinforcements', 'coordinates', 'location', 'headquarters', 'outpost', 'harbor', 'convoy', 'patrol', 'password',
  'defend', 'victory', 'treasure', 'island', 'hidden', 'passage', 'castle', 'palace', 'dungeon', 'tunnel', 'chamber', 'scroll',
  'ancient', 'caesar', 'vigenere', 'atbash', 'bacon', 'playfair', 'matrix', 'transposition', 'substitution', 'alphabet', 'key',
  'intelligence', 'reconnaissance', 'objective', 'dispatch', 'courier', 'confidential', 'urgent', 'classified', 'clearance',
  'enigma', 'protocol', 'frequency', 'analysis', 'polyalphabetic', 'monoalphabetic', 'reverse', 'binary', 'hexadecimal', 'algorithm',
  'knowledge', 'wisdom', 'discovery', 'challenge', 'conquest', 'frontier', 'freedom', 'liberty', 'justice', 'courage', 'strategy'
];

export const ENGLISH_DICTIONARY = new Set(WORD_LIST.map((w) => w.toLowerCase()));

/**
 * Calculates Chi-Squared statistic between text letter frequencies and standard English
 * Lower values indicate closer match to English letter distribution.
 */
// Spanish dictionary word corpus
export const SPANISH_DICTIONARY = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo',
  'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son', 'entre', 'esta', 'cuando',
  'muy', 'sin', 'sobre', 'ser', 'tiene', 'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante',
  'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'que',
  'unos', 'yo', 'otro', 'otras', 'otra', 'el', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'sea',
  'tiempo', 'hombre', 'vida', 'mundo', 'gobierno', 'casa', 'dia', 'pais', 'lugar', 'parte', 'ano', 'momento', 'forma', 'historia',
  'fuerza', 'trabajo', 'palabra', 'secreto', 'mensaje', 'clave', 'cifrado', 'codigo', 'ataque', 'orden', 'conocimiento', 'sabiduria',
  'verdad', 'libertad', 'justicia', 'mision', 'descubrir', 'encontrar', 'camino', 'puente', 'castillo', 'ciudad', 'ejercito'
]);

// French dictionary word corpus
export const FRENCH_DICTIONARY = new Set([
  'de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une', 'que', 'est', 'pour', 'qui', 'dans', 'a', 'par', 'plus', 'pas',
  'au', 'sur', 'ne', 'ce', 'il', 'sont', 'se', 'avec', 'tout', 'fait', 'son', 'mais', 'nous', 'comme', 'ou', 'si', 'leur', 'y',
  'elle', 'cette', 'vous', 'deux', 'autres', 'meme', 'aussi', 'apres', 'bien', 'ces', 'sans', 'faire', 'peut', 'tous', 'ete',
  'temps', 'homme', 'vie', 'monde', 'gouvernement', 'maison', 'jour', 'pays', 'lieu', 'partie', 'an', 'moment', 'forme', 'histoire',
  'force', 'travail', 'parole', 'secret', 'message', 'cle', 'chiffre', 'code', 'ordre', 'connaissance', 'sagesse', 'verite',
  'liberte', 'justice', 'mission', 'decouvrir', 'trouver', 'chemin', 'pont', 'chateau', 'ville', 'armee', 'roi', 'etoile'
]);

// German dictionary word corpus
export const GERMAN_DICTIONARY = new Set([
  'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'fur', 'ist', 'im', 'dem', 'nicht', 'ein',
  'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am',
  'sind', 'noch', 'wie', 'einem', 'uber', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis',
  'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'prozent', 'hatte', 'kann', 'gegen', 'vom', 'konnen', 'schon', 'wenn', 'habe',
  'zeit', 'mensch', 'leben', 'welt', 'haus', 'tag', 'land', 'ort', 'teil', 'jahr', 'moment', 'form', 'geschichte', 'kraft',
  'arbeit', 'wort', 'geheimnis', 'botschaft', 'schlussel', 'chiffre', 'code', 'ordnung', 'wissen', 'weisheit', 'wahrheit',
  'freiheit', 'gerechtigkeit', 'mission', 'entdecken', 'finden', 'weg', 'brucke', 'schloss', 'stadt', 'armee', 'konig'
]);

// Italian dictionary word corpus
export const ITALIAN_DICTIONARY = new Set([
  'di', 'e', 'il', 'la', 'che', 'in', 'un', 'per', 'una', 'del', 'con', 'a', 'della', 'si', 'da', 'non', 'dei', 'le', 'delle',
  'ha', 'i', 'al', 'lo', 'sono', 'alla', 'su', 'anche', 'piu', 'era', 'come', 'gli', 'degli', 'ad', 'dall', 'questo', 'ma',
  'dal', 'dalla', 'nel', 'se', 'o', 'ci', 'nei', 'loro', 'ed', 'fatto', 'questa', 'dove', 'alle', 'dopo', 'prima', 'tempo',
  'uomo', 'vita', 'mondo', 'governo', 'casa', 'giorno', 'paese', 'luogo', 'parte', 'anno', 'momento', 'forma', 'storia', 'forza',
  'lavoro', 'parola', 'segreto', 'messaggio', 'chiave', 'cifra', 'codice', 'ordine', 'conoscenza', 'saggezza', 'verita',
  'liberta', 'giustizia', 'missione', 'scoprire', 'trovare', 'strada', 'ponte', 'castello', 'citta', 'esercito', 'stella'
]);

// Latin dictionary word corpus
export const LATIN_DICTIONARY = new Set([
  'in', 'et', 'non', 'ad', 'est', 'ut', 'cum', 'ab', 'per', 'de', 'sed', 'qui', 'quae', 'quod', 'ex', 'si', 'nec', 'aut', 'iam',
  'atque', 'ne', 'tam', 'nam', 'inter', 'sic', 'sub', 'pro', 'se', 'ille', 'hoc', 'haec', 'res', 'dies', 'homo', 'vita', 'mundus',
  'domus', 'annus', 'tempus', 'locus', 'pars', 'forma', 'historia', 'virtus', 'opus', 'verbum', 'secretum', 'nuntius', 'clavis',
  'sapientia', 'scientia', 'veritas', 'libertas', 'iustitia', 'missio', 'invenire', 'via', 'pons', 'castrum', 'urbs', 'exercitus',
  'rex', 'stella', 'natura', 'deus', 'corpus', 'mens', 'animus', 'fides', 'pax', 'bellum', 'lex', 'ordo', 'auctoritas'
]);

export function getLanguageDictionary(lang = 'en'): Set<string> {
  switch (lang) {
    case 'es': return SPANISH_DICTIONARY;
    case 'fr': return FRENCH_DICTIONARY;
    case 'de': return GERMAN_DICTIONARY;
    case 'it': return ITALIAN_DICTIONARY;
    case 'la': return LATIN_DICTIONARY;
    default: return ENGLISH_DICTIONARY;
  }
}

/**
 * Calculates Chi-Squared statistic between text letter frequencies and target language
 * Lower values indicate closer match to letter distribution.
 */
export function calculateChiSquared(text: string, language = 'en'): number {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = letters.length;
  if (n === 0) return 9999;

  const targetFrequencies = getLanguageFrequencies(language);

  const counts: Record<string, number> = {};
  for (let i = 0; i < 26; i++) {
    counts[String.fromCharCode(65 + i)] = 0;
  }
  for (const ch of letters) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let chiSq = 0;
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    const observed = counts[ch];
    const expected = ((targetFrequencies[ch] || 0.01) / 100) * n;
    const diff = observed - expected;
    chiSq += (diff * diff) / (expected || 0.001);
  }

  return chiSq;
}

/**
 * Calculates the Index of Coincidence (IoC)
 * IoC = sum(f_i * (f_i - 1)) / (N * (N - 1))
 */
export function calculateIoC(text: string): number {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = letters.length;
  if (n <= 1) return 0;

  const counts: Record<string, number> = {};
  for (const ch of letters) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let sum = 0;
  for (const count of Object.values(counts)) {
    sum += count * (count - 1);
  }

  return sum / (n * (n - 1));
}

/**
 * Calculates Shannon Entropy of text
 */
export function calculateEntropy(text: string): number {
  if (text.length === 0) return 0;
  const counts: Record<string, number> = {};
  for (const ch of text) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let entropy = 0;
  const len = text.length;
  for (const count of Object.values(counts)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Finds repeated n-grams and their distances (Kasiski examination)
 * Used to estimate possible Vigenère key lengths
 */
export function findRepeatedNgrams(
  text: string,
  ngramLength = 3,
  minOccurrences = 2
): Array<{ ngram: string; count: number; distances: number[] }> {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const positions: Record<string, number[]> = {};

  for (let i = 0; i <= clean.length - ngramLength; i++) {
    const sub = clean.slice(i, i + ngramLength);
    if (!positions[sub]) {
      positions[sub] = [];
    }
    positions[sub].push(i);
  }

  const results: Array<{ ngram: string; count: number; distances: number[] }> = [];

  for (const [ngram, posList] of Object.entries(positions)) {
    if (posList.length >= minOccurrences) {
      const distances: number[] = [];
      for (let i = 1; i < posList.length; i++) {
        distances.push(posList[i] - posList[i - 1]);
      }
      results.push({ ngram, count: posList.length, distances });
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count);
  return results.slice(0, 15);
}

/**
 * Estimates probable Vigenère key lengths from repeated n-gram distances
 */
export function estimateVigenereKeyLengths(
  repeatedNgrams: Array<{ ngram: string; distances: number[] }>
): number[] {
  const factorCounts: Record<number, number> = {};

  for (const item of repeatedNgrams) {
    for (const dist of item.distances) {
      for (let f = 2; f <= 16; f++) {
        if (dist % f === 0) {
          factorCounts[f] = (factorCounts[f] || 0) + 1;
        }
      }
    }
  }

  const sorted = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([factor]) => parseInt(factor, 10));

  return sorted.slice(0, 5);
}
