from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()

        # Added patterns geared towards attractions and restaurants. 
        self.positiveKeywords = [
            "hidden gem", "must try", "must-try", "go-to", "go to",
            "freshest", "fresh", "legit", "underrated", "secret", "worth",
            "winner", "been around forever", "local favorite",
            "authentic", "rec", "would recommend", "my pick", "top pick", "the business", "absolute business"
        ]

        self.negativeKeywords = [
            "fine", "okay", "only option",
            "nothing special", "overrated", "overhyped",
            "meh", "average", "mediocre", "not worth"
        ]

    def analyze(self, text):
        scores = self.vader.polarity_scores(text)
        compound = scores["compound"]
        textLower = text.lower()

        for keyword in self.positiveKeywords:
            if keyword in textLower:
                compound += 0.1

        for keyword in self.negativeKeywords:
            if keyword in textLower:
                compound -= 0.1

        compound = max(-1.0, min(1.0, compound))

        if compound >= 0.05:
            label = "Positive."

        elif compound <= -0.05:
            label = "Negative."

        else:
            label = "Neutral."

        return {
            "compound": round(compound, 3),
            "classification": label,
            "vaderCompound": round(scores["compound"], 3)
        }


def analyzer(texts): #input a comment to run entire vader program
    sentiment = SentimentAnalyzer() #call the class
    if isinstance(texts, str):
        return sentiment.analyze(texts) #only runs if one string
    if isinstance(texts, list) and len(texts) > 0: #if a list of strings
        scores = []
        for text in texts:
            result = sentiment.analyze(text)
            scores.append(result['compound']) #add the compound together
            avg_compound = sum(scores) / len(scores) #divide by the number of strings
            if avg_compound >= 0.05: #same logic as above but with compounded average
                label = "Positive"
            elif avg_compound <= -0.05:
                label = "Negative"
            else:
                label = "Neutral"
        return {
            "compound": round(avg_compound, 3),
            "classification": label,
            "vaderCompound": round(avg_compound, 3)  
        }
    return None

"""
# Same comments that Adam used for spaCy testing. 
sampleComments = [
    "Gyros Plus moved to south 13th, an oldie but a goodie.",
    "Tup Tim Thai - duck curry!!!!",
    "I really enjoyed the zoo at Santa Fe",
    "Jazz nights at The Bull on Tuesdays",
    "I've heard such good things about Mac's drive thru but I haven't tried it yet. I like East End Eatery, 43rd street deli is pretty cute and Civilization is nice and has some interesting menu items. I loved the Ethiopian dish, the pakora pancakes and the sweet potatoe burrito, but I did not think their Thai green curry had any flavor at all. I also love Indian Cuisine (not really a secret place by any means). My new favorite is Zeezenia! Authentic middle eastern/Egyptian food and cheap prices. They are a little slow but everyone that works there is a gem :)",
    "A little outside the city but Pearl's Country Store and BBQ is incredible. It's attached to a gas station/convenience store but it is unbelievable. Definitely worth the drive and certainly underrated.",
    "Not new, but new for me, Indian Aroma was really good",
    "Hogans was hidden to me for a while and my god is it a gem. Giant amazing deli sandwiches for very cheap",
    "Country foodly is good korean-american fusion. Yummy City is good for authentic Chinese and hot pot. Best burgers are at the Alachua Sports Club. Main street Pie Co. has fantastic pizza dough and coffee drinks.",
    "Wine and cheese gallery is a cool place to get a sandwich with a date. When the weather is nice sit outside.",
    "Oh, how about Sababa in the sun center? I'm not actually a huge fan of Falafel but I love their chicken schnitzel and shawarma, the \"salads\" they serve it with and the bourekas too.",
    "Las Pasaditas mexican. My fave mexi by far.",
    "Di Big Jerk where Reggae Shack used to be. New owner super nice guy and his oxtail is better. Def lesser known and worth trying since it reopened.",
    "Caribbean Spice, Country Foodly (Korean breakfast!), Bevs Burgers in Alachua, The Steakout in High Springs (best cheese steaks), Pearls BBQ in Miccanopy. Those are a few of my lesser followed favorites.",
    "seoul pocha",
    "Mac's drive thru...best burger in town",
    "Probably unknown to most but NW Grille has one of the best Sirloin steaks (both price and quality). Also the whole staff is first class.",
    "Brunch at Leonardo's 706 on Sundays. What an incredible buffet, comes with a mimosa for, I believe, $22.",
    "pomodoro is super slept on because it's out by sfcc / i-75 and primarily caters to 1000-year-old retirees but their pizza is probably the best in gainesville and the menu is good if typical red-sauce italian with decent specials. cedar river is top-notch \"everything fried\" southern-style seafood and sides. the double-double at bev's better burgers is the truth.",
    "Mac's Drive Thru. Best cheeseburger in town",
    "Seoul Poka or however you spell it.",
    "POKE Fusion Bowl on 34th formerly JPetal poke are amazing. Best quality and portions poke in town at a great price",
    "Doesn't get mentioned much, but Linda Vista off Tower and Archer. Great Mexican food that is inexpensive and much better than La Tienda and Boca",
    "Garlic and Ginger out on Archer road has amazing Korean food",
    "Gator Suyaki is amazing and so unheard of. Best chinese food in town. Honestly best food in town in my opinion.",
    "Los Tacos de mi abuela - the taco truck before you get to Tractor Supply on 441/13th, in the Hollanders hydraulic parking lot. They are the most authentic tacos I've ever had and they are SO GOOD.",
    "If you're willing to drive a bit, cilantro tacos is amazing. They're out in Newberry.",
    "Abuela's (La Cocina de Abuela). Everyone is all about Mi Apa, which is pretty tasty, but doesn't hold a candle to Abuela's.",
    "idk if its hidden but munecas in the 4th ave food park is the absolute business",
    "Carribean Spice has amazing beef n cheese patties in coco bread. I love the jerk chicken too.",
    "Best hole in the wall place is Caribbean Queen. Great authentic Caribbean food. Cash only though.",
    "Sawamura is my go-to for hibachi. I worked across the street from it at the Subway on 13th and never knew it was there until a coworker told me about it. As others have said, Adam's Rib for barbecue. La Fiesta or La Tienda on SW 13th St. You cannot go wrong with any of those.",
    "Caribbean Spice.",
    "WaHaHa has my favorite pad Thai and I also just went to BleuBird Wings a couple nights ago and it was absolutely fantastic",
    "Square house pizza, it was formerly Satchels Squared, the Motor City is my jam.",
    "M&D Food Truck, not a restaurant but the food is legit and amazing. I highly suggest it for anyone who wants to try African Cuisine",
    "Gyro Plus on SW 13th. Unassuming strip mall location, authentic Mediterranean exasperation from the guy taking your order, and some of best gyros around (their pita is so squishy!). Plus they have like 12 different types of baklava!",
    "So it may not seem like it, but Pirates' Grill was actually really decent. It only has four tables and looks a little kitschy, but the food was really good.",
    "Pho House near University and Main has really fresh, authentic Vietnamese and Thai dishes.",
    "Pearls Country BBQ in Micanopy. It's worth the drive!",
    "Abuela's down 23rd street makes some delicious South American food.",
]

for i, comment in enumerate(sampleComments, 1):
    result = analyzer(comment)
    
    print(f"Comment #{i}:")
    print(f"  Text: {comment}")
    print(f"  VADER Compound:    {result['vaderCompound']:.3f}")
    print(f"  Enhanced Compound: {result['compound']:.3f}")
    print(f"  Classification: {result['classification']}")
    print()

"""