from app.services.embeddings import get_embeddings

embeddings = get_embeddings()

text = "Web technology includes HTML, CSS and JavaScript."

vector = embeddings.embed_query(text)

print("\nEmbedding created successfully!")
print(f"Vector dimensions: {len(vector)}")
print(f"First 10 values: {vector[:10]}")