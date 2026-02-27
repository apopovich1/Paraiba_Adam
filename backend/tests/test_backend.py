#dependencies spacy, spacy download en_core_web_lg
import pytest
from unittest.mock import MagicMock, patch, PropertyMock
# magic mock creates fake object, patch replaces code, propertymock mocks properties

@pytest.fixture(scope="module") #get module for spaCyNER and resusable for all tests
def ner():
    from spaCyNER import spaCyEntities
    return spaCyEntities()

class TestCleanEntity: 
    #tests for spaCyentities.clean_entity()

    @pytest.fixture(autouse=True) #fixture runs every test in its scope
    def setup(self):
        with patch("spaCyNER.spacy.load") as mock_load:#replaces with fake data
            mock_nlp = MagicMock()
            mock_load.return_value = mock_nlp.add_pipe.return_value = MagicMock()
            from spaCyNER import spaCyEntities
            self.ner = spaCyEntities() #initialize spacy for mock tests

    def test_removes_extra_whitespace(self): #test for correctly handling white space
        assert self.ner.clean_entity("  Satchel's Pizza ") == "Satchel's Pizza"

    def test_normalises_single_quote(self): # checks for single quote
        result = self.ner.clean_entity("Satchel\u2019s Pizza")
        assert "Satchel" in result  

    def test_normalises_double_quotes(self): #checks if double quotes are handled
        result = self.ner.clean_entity("\u201cThe Venue\u201d")
        assert "The Venue" in result

    #the next couple check if extra words are removed from the front of the text
    def test_strips_leading_at(self): #checks if it removes the word "at"
        assert self.ner.clean_entity("at Dragonfly") == "Dragonfly"

    def test_strips_leading_ate(self): #checks if it removes the word "ate"
        assert self.ner.clean_entity("ate El Indio") == "El Indio"

    def test_strips_leading_went_to(self): #check if went is removed from the front
        result = self.ner.clean_entity("went Karma Cream")
        assert result == "Karma Cream"

    def test_strips_leading_cuisine_label(self): #checks if words are removed from the front with :
        assert self.ner.clean_entity("thai: Green Papaya") == "Green Papaya"

    def test_strips_leading_comma(self): #checks if commas are removed
        assert self.ner.clean_entity(", Dragonfly") == "Dragonfly"

    #the next two are to check if words after the name are removed
    def test_strips_trailing_is(self): #check if it removes is from the end
        assert self.ner.clean_entity("Paper Bag Deli is") == "Paper Bag Deli"

    def test_strips_trailing_was(self): #checks if it removes was
        assert self.ner.clean_entity("Venue was") == "Venue"

    #edge cases for words that are too short or not a name
    def test_single_char_returns_empty(self): #single letters that are titles
        assert self.ner.clean_entity("A") == ""

    def test_empty_string_returns_empty(self):#empty comment handling
        assert self.ner.clean_entity("") == ""

    def test_filler_word_returns_empty(self): #filler word cleaning
        assert self.ner.clean_entity("the") == ""

    def test_filler_word_mixed_case_returns_empty(self): #test for title filler words
        assert self.ner.clean_entity("The") == ""

    def test_thats_uppercase_edge_case(self): #test for titles with apostrophe
        assert self.ner.clean_entity("That's") == ""

    #The next few test if the actual names go through
    def test_normal_restaurant_name(self): #Check for easy name
        assert self.ner.clean_entity("Dragonfly") == "Dragonfly"

    def test_possessive_name(self): #check for names with apostrophes
        assert self.ner.clean_entity("Satchel's Pizza") == "Satchel's Pizza"

    def test_multi_word_name(self): #Check for multiple title names
        assert self.ner.clean_entity("Hana Sushi Grill") == "Hana Sushi Grill"


class TestExtractLocations: #This is testing the full spacy experience

    def _make_ent(self, text, label): #helper to create a fake spacy object
        ent = MagicMock()
        ent.text = text #fake text
        ent.label_ = label #fake label
        return ent

    def _build_ner_with_ents(self, ents): #creates a spacyEntities instance and replaces instance.nlp
        with patch("spaCyNER.spacy.load") as mock_load:
            mock_nlp = MagicMock()
            mock_load.return_value = mock_nlp
            mock_nlp.add_pipe.return_value = MagicMock()

            from spaCyNER import spaCyEntities
            instance = spaCyEntities()

        doc = MagicMock() #fake document to load the spacy entities into
        doc.ents = ents
        instance.nlp = MagicMock(return_value=doc)
        return instance

    def test_returns_list(self): #Returns the list 
        ner = self._build_ner_with_ents([])
        result = ner.extract_locations("some text")
        assert isinstance(result, list)

    def test_single_place_entity(self): #Ensure that is is getting the name as well as the correct classifier
        ents = [self._make_ent("at Dragonfly", "PLACE")]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("I ate at Dragonfly yesterday")
        assert "Dragonfly" in result

    def test_non_place_labels_ignored(self):
        ents = [ #Checking what the names are classified as
            self._make_ent("Gainesville", "GPE"), #geopolitical entiies
            self._make_ent("at Satchel's", "PLACE"), #this is the one we want
        ]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("Gainesville has Satchel's")
        assert len(result) == 1
        assert result[0] == "Satchel's"

    def test_deduplication(self): #See if it checks for duplicates
        ents = [
            self._make_ent("at Dragonfly", "PLACE"),
            self._make_ent("at Dragonfly", "PLACE"),  # duplicate
        ]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("Dragonfly is great. Dragonfly rules.")
        assert result.count("Dragonfly") == 1

    def test_case_insensitive_deduplication(self): #check if it does not pick
        #up non Titile names
        ents = [
            self._make_ent("at Dragonfly", "PLACE"),
            self._make_ent("at dragonfly", "PLACE"),
        ]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("text")
        assert len(result) == 1

    def test_unicode_apostrophe_normalised(self):
        #Checking for apostrophe
        ents = [self._make_ent("at Satchel\u2019s Pizza", "PLACE")]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("I love Satchel\u2019s Pizza")
        assert len(result) == 1
        assert "Satchel" in result[0]

    def test_empty_text_returns_empty_list(self):
        #make sure that it deals with empty comments correctly
        ner = self._build_ner_with_ents([])
        assert ner.extract_locations("") == []

    def test_multiple_distinct_places(self):
        ents = [
            #Ensure that it picks up all names in multiple comments
            self._make_ent("at Dragonfly", "PLACE"),
            self._make_ent("at El Indio", "PLACE"),
            self._make_ent("visited Karma Cream", "PLACE"),
        ]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("some text")
        assert len(result) == 3

    def test_filler_entities_excluded(self):
        ents = [self._make_ent("the", "PLACE")]
        ner = self._build_ner_with_ents(ents)
        result = ner.extract_locations("the")
        assert result == []
        #ensure that filler lists are not picked up


#This is now the test to do SpaCy fully 
class TestSpaCyFull:
    def test_returns_list(self):
        with patch("spaCyNER.spaCyEntities") as MockClass:
            mock_instance = MagicMock()
            mock_instance.extract_locations.return_value = ["Dragonfly"]
            MockClass.return_value = mock_instance
            #ensure that it returns a list from an entity name

            from spaCyNER import spaCy_full
            result = spaCy_full("I love Dragonfly")
            assert result == ["Dragonfly"] #check that it gets DragonFly correcly

    def test_creates_new_instance_each_call(self):
        #make sure that each instance calls spacy each time
        with patch("spaCyNER.spaCyEntities") as MockClass:
            mock_instance = MagicMock()
            mock_instance.extract_locations.return_value = []
            MockClass.return_value = mock_instance

            from spaCyNER import spaCy_full
            spaCy_full("text one")
            spaCy_full("text two")
            assert MockClass.call_count == 2

@pytest.mark.integration
class TestIntegrationSpaCy: #this tests the real spacy model fully

    #These test patterns directly
    def test_went_to_pattern(self, ner):
        result = ner.extract_locations("We went to Satchel's last night.")
        assert any("Satchel" in r for r in result)
        #went to pattern

    def test_at_pattern(self, ner):
        result = ner.extract_locations("Had lunch at El Indio today.")
        assert any("El Indio" in r for r in result)
        #at pattern

    def test_possessive_gas_station_comment(self, ner):
        text = (
            "Pearl's Country Store and BBQ is incredible. "
            "It's attached to a gas station."
        )
        result = ner.extract_locations(text)
        assert any("Pearl" in r for r in result)
        #Test with multiple sentence comments

    def test_no_false_positives(self, ner):
        text = "The weather in Florida is really nice in spring."
        result = ner.extract_locations(text)
        # Should not extract generic words
        for r in result:
            assert r.lower() not in {"the", "a", "an", "it", "is"}

    def test_multiple_locations_in_one_comment(self, ner):
        text = "Try Satchel's for pizza and visit Dragonfly for cocktails."
        result = ner.extract_locations(text)
        assert len(result) >= 2
        #check that two names get emplaced