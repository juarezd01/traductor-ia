import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const TONES = [
  { value: "neutral", label: "Neutro" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Natural" },
  { value: "academic", label: "Académico" },
];

function fallbackTranslate(text) {
  const dictionary = {
    hello: "hola",
    hi: "hola",
    welcome: "bienvenido",
    good: "bueno",
    morning: "mañana",
    afternoon: "tarde",
    night: "noche",
    please: "por favor",
    thanks: "gracias",
    thank: "gracias",
    you: "tú",
    how: "cómo",
    are: "estás",
    i: "yo",
    love: "amo",
    this: "esto",
    app: "aplicación",
    translation: "traducción",
    translator: "traductor",
    artificial: "artificial",
    intelligence: "inteligencia",
    language: "idioma",
    text: "texto",
    world: "mundo",
    friend: "amigo",
    study: "estudiar",
    university: "universidad",
  };

  return text
    .split(/(\s+|[.,!?;:()"'\-])/)
    .map((token) => {
      const lower = token.toLowerCase();
      if (!dictionary[lower]) return token;

      const translated = dictionary[lower];
      if (token === token.toUpperCase()) return translated.toUpperCase();
      if (token[0] && token[0] === token[0].toUpperCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1);
      }
      return translated;
    })
    .join("");
}

export default function HomeScreen() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [tone, setTone] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const stats = useMemo(() => {
    const chars = sourceText.length;
    const words = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [sourceText]);

  const backendUrl =
    Constants.expoConfig?.extra?.backendUrl ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "";

  async function translateText() {
    if (!sourceText.trim()) {
      Alert.alert("Falta texto", "Escribe un texto en inglés para traducir.");
      return;
    }

    setLoading(true);
    setUsingFallback(false);

    try {
      if (!backendUrl) {
        setTranslatedText(fallbackTranslate(sourceText));
        setUsingFallback(true);
        return;
      }

      const response = await fetch(`${backendUrl}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo completar la traducción.");
      }

      const data = await response.json();
      if (!data.translation) {
        throw new Error("Respuesta inválida del servidor.");
      }

      setTranslatedText(data.translation);
    } catch (error) {
      setTranslatedText(fallbackTranslate(sourceText));
      setUsingFallback(true);
      Alert.alert("Aviso", "No se pudo usar la IA. Se aplicó la traducción local de respaldo.");
    } finally {
      setLoading(false);
    }
  }

  async function copyTranslation() {
    if (!translatedText) return;
    await Clipboard.setStringAsync(translatedText);
    Alert.alert("Copiado", "La traducción fue copiada al portapapeles.");
  }

  function clearAll() {
    setSourceText("");
    setTranslatedText("");
    setTone("neutral");
    setUsingFallback(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="language-outline" size={26} color="#0f172a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Traductor IA</Text>
              <Text style={styles.subtitle}>Inglés → Español</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Texto original</Text>
            <TextInput
              value={sourceText}
              onChangeText={setSourceText}
              multiline
              placeholder="Write your text in English..."
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
              style={styles.textarea}
            />

            <View style={styles.statsRow}>
              <Text style={styles.statsText}>Palabras: {stats.words}</Text>
              <Text style={styles.statsText}>Caracteres: {stats.chars}</Text>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Tono</Text>
            <View style={styles.toneRow}>
              {TONES.map((item) => {
                const active = tone === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setTone(item.value)}
                    style={[styles.toneChip, active && styles.toneChipActive]}
                  >
                    <Text style={[styles.toneText, active && styles.toneTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={clearAll}>
                <Ionicons name="refresh-outline" size={18} color="#0f172a" />
                <Text style={styles.secondaryBtnText}>Limpiar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={translateText} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                    <Text style={styles.primaryBtnText}>Traducir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Traducción</Text>
            <View style={styles.outputBox}>
              <Text style={translatedText ? styles.outputText : styles.placeholderOutput}>
                {translatedText || "La traducción aparecerá aquí."}
              </Text>
            </View>

            <View style={styles.footerRow}>
              <View style={{ flex: 1 }}>
                {usingFallback ? (
                  <Text style={styles.badge}>Modo local de respaldo</Text>
                ) : (
                  <Text style={styles.hint}>Usa un backend para traducción con IA real</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.secondaryBtn, !translatedText && { opacity: 0.5 }]}
                onPress={copyTranslation}
                disabled={!translatedText}
              >
                <Ionicons name="copy-outline" size={18} color="#0f172a" />
                <Text style={styles.secondaryBtnText}>Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Cómo activar la IA real</Text>
            <Text style={styles.noteText}>
              Configura EXPO_PUBLIC_BACKEND_URL con la URL de tu servidor y deja que el backend
              haga la llamada a OpenAI. Así no expones la API key dentro de la app móvil.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
    marginBottom: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 10,
  },
  textarea: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  statsText: {
    color: "#64748b",
    fontSize: 13,
  },
  toneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toneChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  toneChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  toneText: {
    color: "#0f172a",
    fontWeight: "500",
  },
  toneTextActive: {
    color: "#fff",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eef2f7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
  outputBox: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    justifyContent: "flex-start",
  },
  outputText: {
    color: "#0f172a",
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderOutput: {
    color: "#94a3b8",
    fontSize: 16,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  badge: {
    color: "#92400e",
    backgroundColor: "#fef3c7",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
    fontSize: 13,
  },
  hint: {
    color: "#64748b",
    fontSize: 13,
  },
  noteCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 20,
    padding: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0c4a6e",
    marginBottom: 6,
  },
  noteText: {
    color: "#075985",
    lineHeight: 21,
  },
});
