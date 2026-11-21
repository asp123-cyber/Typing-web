const LEFT_KEYS = 'qwertysdfgzxcvb';
const RIGHT_KEYS = [...'abcdefghijklmnopqrstuvwxyz'].filter(key => !LEFT_KEYS.includes(key)).join('');
const vocabulary = `
bee bees be bed beds beef beefy beer beers beet beets beg begs begged bet bets better best berry berries
bred breed breeds breeze breezes breezy brew brews brewed by bye byte bytes
cry crest crests crew crews creed creeds creep creek creeks cress crested
debt debts debut deed deeds deer defer defers deft defy degree degrees dense desert deserts deserted deserve deserved
dew dewy dex dryer dryers dry dye dyes dyed dyer dress dresses dressed dresser dressy drew dredge dredged
ebb ebbs edge edges edged edgy egg eggs egret egrets err errs erred ester ether ethers every ever ewe ewes
eye eyes eyed exert exerts exerted excess exec expect expert
fed fee fees feed feeds feeder feeders feel feet fete fetes fever fevers fewer few fey fez fiber fiery
fret frets fretted free frees freed freeze freezes freezer freezers fretter fry fryer fryers
get gets getter geyser geysers geyser grey greys greyer greed greedy greet greets greeted greeter grew
jest jested jet jets keg kegs key keys
red reds reed reeds reedy reef reefs ref refs refer refers referee referees regret regrets regressed regress
reset resets reserve reserves reserved rest rests rested restless retest retests tested retry return
revered reverse reversed reverses revert reverts reverted review revved rev revs
rye ryegrass see sees seed seeds seeded seedy seer seers seethe sedge serve serves served server servers
set sets setter setters sever severs severed severe sewer sewers sew sews sewed sewn
shed shred shy scry scree screed screw screws screwed screwy scythe sect sects secret secrets
sly sky sty stye stet stew stews stewed steed steeds steer steers steered steel steep
street streets stress stresses stressed stretch strew strews stray
sweet sweets sweeter sweetest sweep swept swerves swerve swerved swell swift
tree trees treed trek treks trey tress tresses test tests tester testers tested testy terse terser
try tryst trysts tweed tweeds tweedy twee tweet tweets tweeted tweezer tweezers
text texts texted vex vexes vexed vet vets vetted very verb verbs verse verses versed verve vest vests vested
web webs webbed wed weds weed weeds weedy wee weep wept were west wet wets wetter worst wrest wrests wrested
wry wryer yes yet yew yews zest zests zesty zed zeds
ah aha aim aims ail alamo alkali all allow allium ally alma aloha alum alumni am ammo amok an animal amnia
ankh annal annul annual anomaly anon anvil any apiary app appall apple apply
ha hah hail hair hall halo ham hammock hang hank hap happen happy haul haiku
hi hill him hip hiya ho hoax hock hold holm honk hook hoop hop hope hour howl
hula hull hum human hump hulk huh hull hullo
ilk ill imam imp impair impala imply in inch ink inkling inn inlay input ion ionic
jam jinn jail jalopy jalap jump junko junk junkman jink join joint jojo
kapok karma kayak khaki khan kiln kilo kill killjoy kilohm kin kink kip knoll koala koi kola
la lain lair lake lama lamp lanai lank lap lapp lasso limn limp link linn lino lion lip llama
llano loan loam lock loll loin loom loon loop look lop loping loud loup luau lull lump luma lunar lung lupin
ma mail maim main mall mama mamma mammal mammon man mania manila manna manual map mark maul maxi
milk mill milo mil min mini minim minima minimal minimum minima mink minion minor mint miso
moan moat mock mojo moll mom mommy monk mono moon moonlit moor mop mound moult mum mummify mumu muon
nah nail naan nana nanny nap napkin naval nil nikau nip noon nook noun null numb nun nylon
oaf oak oink oil oily ok okay okapi okra olio onion online on only onto opal open opera opinion
opium opt oral ouch our out oval own ox
pa pail pain pair plain plan plank plant palm pal pall paloma pan panda panel panic papa papal papaya
papilla park paul pawn paw peak piano pika pika pill pillow pilot pin pink pinko pinion pip pippin
plum plump plunk plop plug plough plus ply poach poem poke poll polo polka pomp pompom pond pool
poon pop poplin pompano pork poult pound pour prank prawn prim primp pulp pull puma pump pumpkin pun punk pupil pup upon up uplink
terminal velocity studio console precision rhythm practice orbit signal vector cursor motion cadence fluent
quiet focus drift ripple echo amber ember copper cobalt alpine valley river summit shadow lunar solar
nebula comet planet launch stellar horizon prism pulse circuit switch pattern canvas pixel frame render
design build logic syntax network binary system keyboard passage letter language novel paper story
forest ocean cloud meadow garden morning evening season autumn winter spring summer
anchor silver stone velvet marble maple willow birch cedar fern moss olive coral clay linen glass
steady smooth gentle vivid bright clear rapid swift crisp warm cool calm fresh open deep light
bridge travel journey wander explore gather create sketch compose listen breathe measure balance
texture contour lattice spiral sphere arc grid curve plane angle depth scale space speed tempo
`.trim().split(/\s+/);
const dictionary = [...new Set(vocabulary)];
const banks = { both: dictionary };
for (const [hand, keys] of Object.entries({left: LEFT_KEYS, right: RIGHT_KEYS})) {
    banks[hand] = dictionary.filter(word => [...word].every(letter => keys.includes(letter)));
}
