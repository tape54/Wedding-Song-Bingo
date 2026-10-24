/**
 * Built-in catalog of songs commonly played at wedding receptions, so the
 * type-ahead works instantly and offline even when the online catalog is
 * unreachable. One "Title|Artist" per line.
 */
const RAW = `
Mr. Brightside|The Killers
September|Earth, Wind & Fire
Let's Groove|Earth, Wind & Fire
Boogie Wonderland|Earth, Wind & Fire
Shut Up and Dance|WALK THE MOON
Uptown Funk|Mark Ronson
Don't Stop Believin'|Journey
Don't Stop Me Now|Queen
Bohemian Rhapsody|Queen
Another One Bites the Dust|Queen
Crazy Little Thing Called Love|Queen
Somebody to Love|Queen
I Wanna Dance with Somebody (Who Loves Me)|Whitney Houston
How Will I Know|Whitney Houston
I Will Always Love You|Whitney Houston
Dancing Queen|ABBA
Gimme! Gimme! Gimme! (A Man After Midnight)|ABBA
Mamma Mia|ABBA
Waterloo|ABBA
Take a Chance on Me|ABBA
Super Trouper|ABBA
Fernando|ABBA
The Winner Takes It All|ABBA
Voulez-Vous|ABBA
Does Your Mother Know|ABBA
Knowing Me, Knowing You|ABBA
SOS|ABBA
Chiquitita|ABBA
Lay All Your Love on Me|ABBA
Money, Money, Money|ABBA
Honey, Honey|ABBA
Thank You for the Music|ABBA
I Have a Dream|ABBA
Summer Night City|ABBA
Angeleyes|ABBA
Ring Ring|ABBA
I Do, I Do, I Do, I Do, I Do|ABBA
Hasta Mañana|ABBA
Shout|The Isley Brothers
Twist and Shout|The Beatles
Hey Jude|The Beatles
All You Need Is Love|The Beatles
Here Comes the Sun|The Beatles
I Want to Hold Your Hand|The Beatles
Sweet Caroline|Neil Diamond
Livin' on a Prayer|Bon Jovi
You Give Love a Bad Name|Bon Jovi
It's My Life|Bon Jovi
Billie Jean|Michael Jackson
Thriller|Michael Jackson
Beat It|Michael Jackson
Don't Stop 'Til You Get Enough|Michael Jackson
Rock with You|Michael Jackson
Wanna Be Startin' Somethin'|Michael Jackson
The Way You Make Me Feel|Michael Jackson
Smooth Criminal|Michael Jackson
Man in the Mirror|Michael Jackson
Black or White|Michael Jackson
Can You Feel It|The Jacksons
ABC|The Jackson 5
I Want You Back|The Jackson 5
Celebration|Kool & The Gang
Get Down On It|Kool & The Gang
Ladies' Night|Kool & The Gang
Jungle Boogie|Kool & The Gang
Love Shack|The B-52's
Hey Ya!|OutKast
Ms. Jackson|OutKast
Crazy in Love|Beyoncé
Single Ladies (Put a Ring on It)|Beyoncé
Love On Top|Beyoncé
Halo|Beyoncé
Drunk in Love|Beyoncé
CUFF IT|Beyoncé
Run the World (Girls)|Beyoncé
Survivor|Destiny's Child
Say My Name|Destiny's Child
Bootylicious|Destiny's Child
Yeah!|Usher
OMG|Usher
DJ Got Us Fallin' in Love|Usher
Party Rock Anthem|LMFAO
Sexy and I Know It|LMFAO
I Gotta Feeling|The Black Eyed Peas
Let's Get It Started|The Black Eyed Peas
Pump It|The Black Eyed Peas
Boom Boom Pow|The Black Eyed Peas
Shake It Off|Taylor Swift
Love Story|Taylor Swift
You Belong with Me|Taylor Swift
Blank Space|Taylor Swift
Style|Taylor Swift
Cruel Summer|Taylor Swift
Anti-Hero|Taylor Swift
Lover|Taylor Swift
Paper Rings|Taylor Swift
22|Taylor Swift
We Are Never Ever Getting Back Together|Taylor Swift
Shake It Off|Taylor Swift
Wannabe|Spice Girls
Spice Up Your Life|Spice Girls
...Baby One More Time|Britney Spears
Toxic|Britney Spears
Oops!...I Did It Again|Britney Spears
Womanizer|Britney Spears
Hips Don't Lie|Shakira
Whenever, Wherever|Shakira
She Wolf|Shakira
Waka Waka (This Time for Africa)|Shakira
Livin' la Vida Loca|Ricky Martin
Despacito|Luis Fonsi
Bailando|Enrique Iglesias
Danza Kuduro|Don Omar
Gasolina|Daddy Yankee
Mi Gente|J Balvin
Con Calma|Daddy Yankee
Macarena|Los del Rio
La Bamba|Ritchie Valens
Conga|Gloria Estefan
Rhythm Is Gonna Get You|Gloria Estefan
Cha Cha Slide|DJ Casper
Cupid Shuffle|Cupid
Wobble|V.I.C.
Electric Boogie|Marcia Griffiths
Y.M.C.A.|Village People
Macho Man|Village People
Footloose|Kenny Loggins
Danger Zone|Kenny Loggins
(I've Had) The Time of My Life|Bill Medley
Hungry Eyes|Eric Carmen
Girls Just Want to Have Fun|Cyndi Lauper
Time After Time|Cyndi Lauper
Like a Prayer|Madonna
Vogue|Madonna
Holiday|Madonna
Material Girl|Madonna
Into the Groove|Madonna
Hung Up|Madonna
Celebration|Madonna
Walking on Sunshine|Katrina & The Waves
Footloose|Blake Shelton
I'm Gonna Be (500 Miles)|The Proclaimers
Come On Eileen|Dexys Midnight Runners
Tainted Love|Soft Cell
Don't You Want Me|The Human League
Take On Me|a-ha
Jessie's Girl|Rick Springfield
Total Eclipse of the Heart|Bonnie Tyler
Holding Out for a Hero|Bonnie Tyler
Africa|Toto
Rosanna|Toto
Never Gonna Give You Up|Rick Astley
Wake Me Up Before You Go-Go|Wham!
Last Christmas|Wham!
Faith|George Michael
Freedom! '90|George Michael
Careless Whisper|George Michael
Sweet Dreams (Are Made of This)|Eurythmics
Everybody Wants to Rule the World|Tears for Fears
Don't You (Forget About Me)|Simple Minds
Just Can't Get Enough|Depeche Mode
Here Comes the Rain Again|Eurythmics
Billie Jean|Michael Jackson
Pour Some Sugar on Me|Def Leppard
Summer of '69|Bryan Adams
Everything I Do (I Do It for You)|Bryan Adams
You Shook Me All Night Long|AC/DC
Highway to Hell|AC/DC
Thunderstruck|AC/DC
Back in Black|AC/DC
Sweet Child O' Mine|Guns N' Roses
Paradise City|Guns N' Roses
Jump|Van Halen
Panama|Van Halen
Eye of the Tiger|Survivor
We Will Rock You|Queen
I Love Rock 'n' Roll|Joan Jett & The Blackhearts
Rock and Roll All Nite|KISS
I Was Made for Lovin' You|KISS
Don't Stop|Fleetwood Mac
Dreams|Fleetwood Mac
Go Your Own Way|Fleetwood Mac
Brown Eyed Girl|Van Morrison
Into the Mystic|Van Morrison
Moondance|Van Morrison
Sweet Home Alabama|Lynyrd Skynyrd
Free Bird|Lynyrd Skynyrd
American Pie|Don McLean
Mony Mony|Billy Idol
White Wedding|Billy Idol
Rebel Yell|Billy Idol
Uptown Girl|Billy Joel
Piano Man|Billy Joel
Only the Good Die Young|Billy Joel
You May Be Right|Billy Joel
Tiny Dancer|Elton John
I'm Still Standing|Elton John
Your Song|Elton John
Crocodile Rock|Elton John
Bennie and the Jets|Elton John
Saturday Night's Alright for Fighting|Elton John
Can You Feel the Love Tonight|Elton John
Rocket Man|Elton John
Cold Heart (PNAU Remix)|Elton John
Respect|Aretha Franklin
Think|Aretha Franklin
(You Make Me Feel Like) A Natural Woman|Aretha Franklin
I Say a Little Prayer|Aretha Franklin
Ain't No Mountain High Enough|Marvin Gaye
Let's Get It On|Marvin Gaye
I Heard It Through the Grapevine|Marvin Gaye
Got to Give It Up|Marvin Gaye
My Girl|The Temptations
Ain't Too Proud to Beg|The Temptations
Signed, Sealed, Delivered I'm Yours|Stevie Wonder
Superstition|Stevie Wonder
Sir Duke|Stevie Wonder
Isn't She Lovely|Stevie Wonder
I Just Called to Say I Love You|Stevie Wonder
Higher Ground|Stevie Wonder
Ain't Nobody|Chaka Khan
I'm Every Woman|Chaka Khan
I Feel for You|Chaka Khan
Stand by Me|Ben E. King
Unchained Melody|The Righteous Brothers
You've Lost That Lovin' Feelin'|The Righteous Brothers
At Last|Etta James
What a Wonderful World|Louis Armstrong
L-O-V-E|Nat King Cole
Fly Me to the Moon|Frank Sinatra
The Way You Look Tonight|Frank Sinatra
New York, New York|Frank Sinatra
Come Fly with Me|Frank Sinatra
That's Amore|Dean Martin
Everybody Loves Somebody|Dean Martin
Can't Help Falling in Love|Elvis Presley
Suspicious Minds|Elvis Presley
Jailhouse Rock|Elvis Presley
Hound Dog|Elvis Presley
A Little Less Conversation|Elvis Presley
Burning Love|Elvis Presley
Johnny B. Goode|Chuck Berry
You Never Can Tell|Chuck Berry
Great Balls of Fire|Jerry Lee Lewis
Shout|Otis Day & The Knights
Rock Around the Clock|Bill Haley & His Comets
Twistin' the Night Away|Sam Cooke
Bring It On Home to Me|Sam Cooke
Build Me Up Buttercup|The Foundations
Dancing in the Street|Martha Reeves & The Vandellas
Heat Wave|Martha Reeves & The Vandellas
Stop! In the Name of Love|The Supremes
You Can't Hurry Love|The Supremes
Reach Out I'll Be There|Four Tops
I Can't Help Myself (Sugar Pie Honey Bunch)|Four Tops
Mustang Sally|Wilson Pickett
In the Midnight Hour|Wilson Pickett
Soul Man|Sam & Dave
Hold On, I'm Comin'|Sam & Dave
(Sittin' On) The Dock of the Bay|Otis Redding
Try a Little Tenderness|Otis Redding
I Got You (I Feel Good)|James Brown
Get Up (I Feel Like Being a) Sex Machine|James Brown
Papa's Got a Brand New Bag|James Brown
Le Freak|CHIC
Good Times|CHIC
We Are Family|Sister Sledge
He's the Greatest Dancer|Sister Sledge
I Will Survive|Gloria Gaynor
Never Can Say Goodbye|Gloria Gaynor
Hot Stuff|Donna Summer
Last Dance|Donna Summer
I Feel Love|Donna Summer
Bad Girls|Donna Summer
On the Radio|Donna Summer
Stayin' Alive|Bee Gees
You Should Be Dancing|Bee Gees
Night Fever|Bee Gees
How Deep Is Your Love|Bee Gees
More Than a Woman|Bee Gees
Disco Inferno|The Trammps
Boogie Shoes|KC and the Sunshine Band
That's the Way (I Like It)|KC and the Sunshine Band
Get Down Tonight|KC and the Sunshine Band
Shake Your Booty|KC and the Sunshine Band
Give It Up|KC and the Sunshine Band
Car Wash|Rose Royce
Got to Be Real|Cheryl Lynn
Ring My Bell|Anita Ward
Funkytown|Lipps Inc.
It's Raining Men|The Weather Girls
Don't Leave Me This Way|Thelma Houston
Love Train|The O'Jays
Brick House|Commodores
Easy|Commodores
All Night Long (All Night)|Lionel Richie
Dancing on the Ceiling|Lionel Richie
Endless Love|Lionel Richie
Hello|Lionel Richie
Let's Dance|David Bowie
Under Pressure|Queen
Modern Love|David Bowie
Kiss|Prince
1999|Prince
Let's Go Crazy|Prince
Little Red Corvette|Prince
Purple Rain|Prince
Raspberry Beret|Prince
When Doves Cry|Prince
Super Freak|Rick James
Give It to Me Baby|Rick James
Word Up!|Cameo
Rapper's Delight|The Sugarhill Gang
It Takes Two|Rob Base and DJ E-Z Rock
Push It|Salt-N-Pepa
Whatta Man|Salt-N-Pepa
Shoop|Salt-N-Pepa
Bust a Move|Young MC
Funky Cold Medina|Tone Loc
Wild Thing|Tone Loc
U Can't Touch This|MC Hammer
Ice Ice Baby|Vanilla Ice
Jump Around|House of Pain
Jump|Kris Kross
Baby Got Back|Sir Mix-a-Lot
Gonna Make You Sweat (Everybody Dance Now)|C+C Music Factory
Rhythm Is a Dancer|Snap!
The Power|Snap!
What Is Love|Haddaway
Rhythm of the Night|Corona
Be My Lover|La Bouche
Mr. Vain|Culture Beat
Pump Up the Jam|Technotronic
Everybody (Backstreet's Back)|Backstreet Boys
I Want It That Way|Backstreet Boys
Larger than Life|Backstreet Boys
Bye Bye Bye|*NSYNC
It's Gonna Be Me|*NSYNC
Tearin' Up My Heart|*NSYNC
MMMBop|Hanson
Blue (Da Ba Dee)|Eiffel 65
Mambo No. 5 (A Little Bit Of...)|Lou Bega
Tubthumping|Chumbawamba
Wonderwall|Oasis
Don't Look Back in Anger|Oasis
Song 2|Blur
Semi-Charmed Life|Third Eye Blind
All Star|Smash Mouth
Walkin' on the Sun|Smash Mouth
Steal My Sunshine|LEN
Kiss Me|Sixpence None the Richer
Torn|Natalie Imbruglia
No Scrubs|TLC
Waterfalls|TLC
Creep|TLC
Poison|Bell Biv DeVoe
No Diggity|Blackstreet
Motownphilly|Boyz II Men
End of the Road|Boyz II Men
I'll Make Love to You|Boyz II Men
Return of the Mack|Mark Morrison
Gettin' Jiggy wit It|Will Smith
Miami|Will Smith
Men in Black|Will Smith
Summertime|DJ Jazzy Jeff & The Fresh Prince
Real Love|Mary J. Blige
Family Affair|Mary J. Blige
Fantasy|Mariah Carey
Always Be My Baby|Mariah Carey
We Belong Together|Mariah Carey
All I Want for Christmas Is You|Mariah Carey
Hold On|Wilson Phillips
Vogue|Madonna
In Da Club|50 Cent
Hot in Herre|Nelly
Ride wit Me|Nelly
Dilemma|Nelly
Get Low|Lil Jon & The East Side Boyz
Low|Flo Rida
Right Round|Flo Rida
Club Can't Handle Me|Flo Rida
Whistle|Flo Rida
Gold Digger|Kanye West
Stronger|Kanye West
Touch the Sky|Kanye West
Empire State of Mind|JAY-Z
Run This Town|JAY-Z
Dirt Off Your Shoulder|JAY-Z
Lose Yourself|Eminem
Without Me|Eminem
The Real Slim Shady|Eminem
SexyBack|Justin Timberlake
Rock Your Body|Justin Timberlake
Can't Stop the Feeling!|Justin Timberlake
Mirrors|Justin Timberlake
Suit & Tie|Justin Timberlake
Promiscuous|Nelly Furtado
Maneater|Nelly Furtado
Hollaback Girl|Gwen Stefani
Umbrella|Rihanna
We Found Love|Rihanna
Only Girl (In the World)|Rihanna
Don't Stop the Music|Rihanna
Pon de Replay|Rihanna
Rude Boy|Rihanna
Work|Rihanna
Diamonds|Rihanna
Just Dance|Lady Gaga
Poker Face|Lady Gaga
Bad Romance|Lady Gaga
Born This Way|Lady Gaga
Rain on Me|Lady Gaga
Shallow|Lady Gaga
Tik Tok|Kesha
Die Young|Kesha
Timber|Pitbull
Give Me Everything|Pitbull
Fireball|Pitbull
Hotel Room Service|Pitbull
Time of Our Lives|Pitbull
Don't Stop the Party|Pitbull
On the Floor|Jennifer Lopez
Let's Get Loud|Jennifer Lopez
Waiting for Tonight|Jennifer Lopez
Jenny from the Block|Jennifer Lopez
Dynamite|Taio Cruz
Yeah 3x|Chris Brown
Forever|Chris Brown
Turn Down for What|DJ Snake
Lean On|Major Lazer
Titanium|David Guetta
When Love Takes Over|David Guetta
Wake Me Up|Avicii
Levels|Avicii
Hey Brother|Avicii
Don't You Worry Child|Swedish House Mafia
Clarity|Zedd
Starships|Nicki Minaj
Super Bass|Nicki Minaj
Firework|Katy Perry
Teenage Dream|Katy Perry
California Gurls|Katy Perry
Last Friday Night (T.G.I.F.)|Katy Perry
Roar|Katy Perry
Dark Horse|Katy Perry
Domino|Jessie J
Price Tag|Jessie J
Raise Your Glass|P!nk
So What|P!nk
Get the Party Started|P!nk
Just Give Me a Reason|P!nk
Moves like Jagger|Maroon 5
Sugar|Maroon 5
Payphone|Maroon 5
This Love|Maroon 5
She Will Be Loved|Maroon 5
Girls Like You|Maroon 5
Treasure|Bruno Mars
Locked Out of Heaven|Bruno Mars
24K Magic|Bruno Mars
Finesse|Bruno Mars
That's What I Like|Bruno Mars
Marry You|Bruno Mars
Just the Way You Are|Bruno Mars
Die With a Smile|Lady Gaga
APT.|ROSÉ
Leave the Door Open|Silk Sonic
Happy|Pharrell Williams
Get Lucky|Daft Punk
One More Time|Daft Punk
Blurred Lines|Robin Thicke
Can't Hold Us|Macklemore & Ryan Lewis
Thrift Shop|Macklemore & Ryan Lewis
Downtown|Macklemore & Ryan Lewis
Shake It Off|Taylor Swift
Call Me Maybe|Carly Rae Jepsen
I Really Like You|Carly Rae Jepsen
Good Time|Owl City
Cheap Thrills|Sia
Chandelier|Sia
Shape of You|Ed Sheeran
Thinking Out Loud|Ed Sheeran
Perfect|Ed Sheeran
Sing|Ed Sheeran
Bad Habits|Ed Sheeran
Shivers|Ed Sheeran
Castle on the Hill|Ed Sheeran
Sugar|Robin Schulz
Cake by the Ocean|DNCE
Can't Feel My Face|The Weeknd
Blinding Lights|The Weeknd
Save Your Tears|The Weeknd
Starboy|The Weeknd
I Feel It Coming|The Weeknd
Levitating|Dua Lipa
Don't Start Now|Dua Lipa
New Rules|Dua Lipa
Physical|Dua Lipa
Dance the Night|Dua Lipa
Houdini|Dua Lipa
One Kiss|Calvin Harris
Feel So Close|Calvin Harris
Summer|Calvin Harris
This Is What You Came For|Calvin Harris
How Deep Is Your Love|Calvin Harris
We Found Love|Calvin Harris
Watermelon Sugar|Harry Styles
As It Was|Harry Styles
Adore You|Harry Styles
Sign of the Times|Harry Styles
Late Night Talking|Harry Styles
What Makes You Beautiful|One Direction
Story of My Life|One Direction
Best Song Ever|One Direction
Juice|Lizzo
Good as Hell|Lizzo
About Damn Time|Lizzo
Truth Hurts|Lizzo
Old Town Road|Lil Nas X
Montero (Call Me by Your Name)|Lil Nas X
Industry Baby|Lil Nas X
Flowers|Miley Cyrus
Party in the U.S.A.|Miley Cyrus
Wrecking Ball|Miley Cyrus
Espresso|Sabrina Carpenter
Please Please Please|Sabrina Carpenter
Good Luck, Babe!|Chappell Roan
HOT TO GO!|Chappell Roan
Pink Pony Club|Chappell Roan
Padam Padam|Kylie Minogue
Can't Get You Out of My Head|Kylie Minogue
Spinning Around|Kylie Minogue
Murder on the Dancefloor|Sophie Ellis-Bextor
Dancing On My Own|Robyn
Mr. Saxobeat|Alexandra Stan
Sweet but Psycho|Ava Max
Kings & Queens|Ava Max
Unwritten|Natasha Bedingfield
Since U Been Gone|Kelly Clarkson
Stronger (What Doesn't Kill You)|Kelly Clarkson
Hey There Delilah|Plain White T's
Hey, Soul Sister|Train
Drops of Jupiter|Train
I'm Yours|Jason Mraz
Home|Edward Sharpe & The Magnetic Zeros
Ho Hey|The Lumineers
Classic|MKTO
Shut Up and Dance|WALK THE MOON
Pompeii|Bastille
Riptide|Vance Joy
Budapest|George Ezra
Shotgun|George Ezra
Mr. Blue Sky|Electric Light Orchestra
Don't Bring Me Down|Electric Light Orchestra
Walking on a Dream|Empire of the Sun
Electric Feel|MGMT
Kids|MGMT
Take Me Out|Franz Ferdinand
Seven Nation Army|The White Stripes
Use Somebody|Kings of Leon
Sex on Fire|Kings of Leon
I Bet You Look Good on the Dancefloor|Arctic Monkeys
Do I Wanna Know?|Arctic Monkeys
Fix You|Coldplay
Viva la Vida|Coldplay
Yellow|Coldplay
A Sky Full of Stars|Coldplay
Something Just Like This|The Chainsmokers
Closer|The Chainsmokers
Don't Let Me Down|The Chainsmokers
Counting Stars|OneRepublic
I Lived|OneRepublic
Believer|Imagine Dragons
Thunder|Imagine Dragons
On Top of the World|Imagine Dragons
Sugar, We're Goin Down|Fall Out Boy
Centuries|Fall Out Boy
Mr. Jones|Counting Crows
Accidentally in Love|Counting Crows
Iris|Goo Goo Dolls
Everlong|Foo Fighters
Learn to Fly|Foo Fighters
Basket Case|Green Day
Good Riddance (Time of Your Life)|Green Day
All the Small Things|blink-182
What's My Age Again?|blink-182
The Middle|Jimmy Eat World
Hey There Delilah|Plain White T's
Mr. Brightside|The Killers
Somebody Told Me|The Killers
Human|The Killers
Ophelia|The Lumineers
Wagon Wheel|Darius Rucker
Friends in Low Places|Garth Brooks
The Dance|Garth Brooks
Callin' Baton Rouge|Garth Brooks
Man! I Feel Like a Woman!|Shania Twain
You're Still the One|Shania Twain
That Don't Impress Me Much|Shania Twain
Any Man of Mine|Shania Twain
Chicken Fried|Zac Brown Band
Before He Cheats|Carrie Underwood
Body Like a Back Road|Sam Hunt
Cruise|Florida Georgia Line
Tennessee Whiskey|Chris Stapleton
Fast Car|Luke Combs
Beautiful Crazy|Luke Combs
Beer Never Broke My Heart|Luke Combs
Die a Happy Man|Thomas Rhett
Marry Me|Thomas Rhett
Speechless|Dan + Shay
10,000 Hours|Dan + Shay
Tequila|Dan + Shay
Cowboy Take Me Away|The Chicks
Goodbye Earl|The Chicks
Boot Scootin' Boogie|Brooks & Dunn
Achy Breaky Heart|Billy Ray Cyrus
Copperhead Road|Steve Earle
Life Is a Highway|Rascal Flatts
Bless the Broken Road|Rascal Flatts
Texas Hold 'Em|Beyoncé
Jolene|Dolly Parton
9 to 5|Dolly Parton
Islands in the Stream|Kenny Rogers
Ring of Fire|Johnny Cash
Jackson|Johnny Cash
Take Me Home, Country Roads|John Denver
Margaritaville|Jimmy Buffett
Gimme All Your Lovin'|ZZ Top
Sharp Dressed Man|ZZ Top
La Grange|ZZ Top
Old Time Rock & Roll|Bob Seger
Born to Run|Bruce Springsteen
Dancing in the Dark|Bruce Springsteen
Glory Days|Bruce Springsteen
Born in the U.S.A.|Bruce Springsteen
Jack & Diane|John Mellencamp
Hurts So Good|John Mellencamp
Footloose|Kenny Loggins
Hold On Loosely|.38 Special
Takin' Care of Business|Bachman-Turner Overdrive
Shout It Out Loud|KISS
Dancing with Myself|Billy Idol
Vacation|The Go-Go's
We Got the Beat|The Go-Go's
Our Lips Are Sealed|The Go-Go's
Walk Like an Egyptian|The Bangles
Manic Monday|The Bangles
Eternal Flame|The Bangles
Heaven Is a Place on Earth|Belinda Carlisle
Hungry Like the Wolf|Duran Duran
Rio|Duran Duran
Girls on Film|Duran Duran
Just the Two of Us|Grover Washington Jr.
Lovely Day|Bill Withers
Ain't No Sunshine|Bill Withers
Use Me|Bill Withers
September|Earth, Wind & Fire
Let's Stay Together|Al Green
Love and Happiness|Al Green
Lean on Me|Bill Withers
Kiss You All Over|Exile
Margaritaville|Jimmy Buffett
Electric Avenue|Eddy Grant
Red Red Wine|UB40
Could You Be Loved|Bob Marley & The Wailers
Three Little Birds|Bob Marley & The Wailers
Is This Love|Bob Marley & The Wailers
One Love/People Get Ready|Bob Marley & The Wailers
Hot Hot Hot|Buster Poindexter
Feliz Navidad|José Feliciano
Hava Nagila|Harry Belafonte
Day-O (The Banana Boat Song)|Harry Belafonte
Zorba's Dance|Mikis Theodorakis
Chicken Dance|The Emeralds
Hokey Pokey|Ray Anthony
The Twist|Chubby Checker
Let's Twist Again|Chubby Checker
The Loco-Motion|Little Eva
The Loco-Motion|Kylie Minogue
Time Warp|The Rocky Horror Picture Show Cast
Grease|Frankie Valli
You're the One That I Want|John Travolta
Greased Lightnin'|John Travolta
Summer Nights|John Travolta
Can't Take My Eyes Off You|Frankie Valli
December, 1963 (Oh, What a Night)|The Four Seasons
Sherry|The Four Seasons
Big Girls Don't Cry|The Four Seasons
Runaround Sue|Dion
The Wanderer|Dion
Shout|Lulu
Do You Love Me|The Contours
Be My Baby|The Ronettes
Then He Kissed Me|The Crystals
Chapel of Love|The Dixie Cups
Going to the Chapel|The Dixie Cups
I'm a Believer|The Monkees
Daydream Believer|The Monkees
Happy Together|The Turtles
Good Vibrations|The Beach Boys
Wouldn't It Be Nice|The Beach Boys
Surfin' U.S.A.|The Beach Boys
Kokomo|The Beach Boys
(I Can't Get No) Satisfaction|The Rolling Stones
Start Me Up|The Rolling Stones
Honky Tonk Women|The Rolling Stones
Brown Sugar|The Rolling Stones
Proud Mary|Ike & Tina Turner
The Best|Tina Turner
What's Love Got to Do with It|Tina Turner
Private Dancer|Tina Turner
Nutbush City Limits|Ike & Tina Turner
Higher Love|Steve Winwood
Higher Love|Kygo
Fortunate Son|Creedence Clearwater Revival
Bad Moon Rising|Creedence Clearwater Revival
Proud Mary|Creedence Clearwater Revival
Down on the Corner|Creedence Clearwater Revival
Born to Be Wild|Steppenwolf
Bang a Gong (Get It On)|T. Rex
Ballroom Blitz|Sweet
Hooked on a Feeling|Blue Swede
Spirit in the Sky|Norman Greenbaum
Black Water|The Doobie Brothers
Listen to the Music|The Doobie Brothers
China Grove|The Doobie Brothers
Hotel California|Eagles
Take It Easy|Eagles
Peaceful Easy Feeling|Eagles
Life in the Fast Lane|Eagles
Dancing in the Moonlight|King Harvest
Dancing in the Moonlight|Toploader
Shining Star|Earth, Wind & Fire
Fantasy|Earth, Wind & Fire
In the Stone|Earth, Wind & Fire
Everybody Wants to Rule the World|Tears for Fears
Head Over Heels|Tears for Fears
Shout|Tears for Fears
Never Tear Us Apart|INXS
Need You Tonight|INXS
Pour Some Sugar on Me|Def Leppard
Wanted Dead or Alive|Bon Jovi
Bed of Roses|Bon Jovi
Here I Go Again|Whitesnake
The Final Countdown|Europe
I Gotta Feeling|The Black Eyed Peas
All of Me|John Legend
Ordinary People|John Legend
Green Light|John Legend
Make You Feel My Love|Adele
Rolling in the Deep|Adele
Rumour Has It|Adele
Set Fire to the Rain|Adele
Hello|Adele
Easy on Me|Adele
Lucky|Jason Mraz
A Thousand Years|Christina Perri
Marry Me|Train
Bubbly|Colbie Caillat
Love Song|Sara Bareilles
I Choose You|Sara Bareilles
Better Together|Jack Johnson
Banana Pancakes|Jack Johnson
Can't Stop|Red Hot Chili Peppers
Under the Bridge|Red Hot Chili Peppers
Give It Away|Red Hot Chili Peppers
Californication|Red Hot Chili Peppers
Valerie|Mark Ronson
Valerie|Amy Winehouse
Rehab|Amy Winehouse
Back to Black|Amy Winehouse
Crazy|Gnarls Barkley
Feel Good Inc.|Gorillaz
Clint Eastwood|Gorillaz
DARE|Gorillaz
Pumped Up Kicks|Foster the People
Tongue Tied|Grouplove
1901|Phoenix
Dog Days Are Over|Florence + The Machine
You've Got the Love|Florence + The Machine
Shake It Out|Florence + The Machine
Royals|Lorde
Green Light|Lorde
Bad Guy|Billie Eilish
Birds of a Feather|Billie Eilish
Lose Control|Teddy Swims
Beautiful Things|Benson Boone
A Bar Song (Tipsy)|Shaboozey
Texas Hold 'Em|Beyoncé
Too Sweet|Hozier
Take Me to Church|Hozier
Greedy|Tate McRae
Water|Tyla
Unholy|Sam Smith
Stay with Me|Sam Smith
Latch|Disclosure
Sweet Disposition|The Temper Trap
Paradise|Coldplay
Wake Me Up|Avicii
Shout|The Isley Brothers
Twist and Shout|The Isley Brothers
This Is How We Do It|Montell Jordan
Tootsee Roll|69 Boyz
Whoomp! (There It Is)|Tag Team
Back That Azz Up|Juvenile
Hey Mama|The Black Eyed Peas
Crank That (Soulja Boy)|Soulja Boy Tell 'Em
Shake It|Metro Station
Crazy Train|Ozzy Osbourne
We're Not Gonna Take It|Twisted Sister
Everybody Talks|Neon Trees
Animal|Neon Trees
Kids in America|Kim Wilde
Hit Me with Your Best Shot|Pat Benatar
Love Is a Battlefield|Pat Benatar
I Love It|Icona Pop
Shots|LMFAO
Shout Out to My Ex|Little Mix
Wings|Little Mix
Sorry|Justin Bieber
Baby|Justin Bieber
What Do You Mean?|Justin Bieber
Peaches|Justin Bieber
Love Yourself|Justin Bieber
Stay|The Kid LAROI
Shake Your Groove Thing|Peaches & Herb
Reunited|Peaches & Herb
Kiss You|One Direction
`

export interface CatalogEntry {
  title: string
  artist: string
}

export const WEDDING_SONGS: CatalogEntry[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [title, artist] = line.split('|')
    return { title: title.trim(), artist: (artist ?? '').trim() }
  })
  .filter((s) => s.title && s.artist)
