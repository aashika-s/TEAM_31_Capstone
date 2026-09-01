from dotenv import load_dotenv
load_dotenv()

import app.services.ocr_pipeline as o

# Load the SAME dictionaries used by the actual pipeline
ingredient_vocab = o.load_ingredient_dictionary()
english_vocab = o.load_english_words()

print("INGREDIENT DICTIONARY SIZE:", len(ingredient_vocab))
print("ENGLISH DICTIONARY SIZE:", len(english_vocab))

print()
print("food    ->", o._dictionary_correct_word(
    "food",
    ingredient_vocab,
    english_vocab
))

print("grade   ->", o._dictionary_correct_word(
    "grade",
    ingredient_vocab,
    english_vocab
))

print("celauin ->", o._dictionary_correct_word(
    "celauin",
    ingredient_vocab,
    english_vocab
))