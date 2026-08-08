import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

/**
 * Pre-cleans raw Markdown text to fix common LLM formatting glitches:
 * - Spacing inside asterisks: "** text **" -> "**text**"
 * - Combined header/list glitches: "**In India (24x7):- **KIRAN" -> "**In India (24x7):**\n- **KIRAN"
 * - Malformed bullets: "-AASRA**" -> "- **AASRA**"
 */
function preprocessMarkdown(rawText) {
  if (!rawText) return '';
  let text = rawText;

  // Fix combined header + list items like "**In India (24x7):- **KIRAN" or "**In India (24x7):-**"
  text = text.replace(/\*\*(.*?):-\s*\*\*/g, '**$1:**\n- **');
  text = text.replace(/\*\*(.*?):-\s*/g, '**$1:**\n- ');

  // Fix malformed bullets without space e.g. "-AASRA**" -> "- **AASRA**"
  text = text.replace(/^-\s*([A-Za-z0-9].*?\*\*)/gm, '- **$1');
  text = text.replace(/^-\s*([A-Za-z0-9]+)/gm, '- $1');

  // Fix spaces right after opening ** or right before closing **
  // e.g. "** do not have to carry **" -> "**do not have to carry**"
  text = text.replace(/\*\*\s+([^\*]+?)\s+\*\*/g, '**$1**');
  text = text.replace(/\*\*\s+([^\*]+?)\*\*/g, '**$1**');
  text = text.replace(/\*\*([^\*]+?)\s+\*\*/g, '**$1**');

  return text;
}

/**
 * Parses inline string into an array of React Text nodes with bold / italic styling.
 */
function parseInlineSpans(str, baseStyle) {
  if (!str) return null;

  const elements = [];
  // Match ***bolditalic***, **bold**, *italic*, _italic_
  const regex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[^\*]+?\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(
        <Text key={`text-${lastIndex}`} style={baseStyle}>
          {str.substring(lastIndex, match.index)}
        </Text>
      );
    }

    const token = match[0];
    if (token.startsWith('***') && token.endsWith('***')) {
      const content = token.slice(3, -3);
      elements.push(
        <Text key={`bi-${match.index}`} style={[baseStyle, styles.bold, styles.italic]}>
          {content}
        </Text>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      elements.push(
        <Text key={`b-${match.index}`} style={[baseStyle, styles.bold]}>
          {content}
        </Text>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      const content = token.slice(1, -1);
      elements.push(
        <Text key={`i-${match.index}`} style={[baseStyle, styles.italic]}>
          {content}
        </Text>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining trailing text
  if (lastIndex < str.length) {
    elements.push(
      <Text key={`text-${lastIndex}`} style={baseStyle}>
        {str.substring(lastIndex)}
      </Text>
    );
  }

  return elements.length > 0 ? elements : str;
}

export function FormattedMarkdown({ text, style }) {
  if (!text) return null;

  const cleanedText = preprocessMarkdown(text);
  const lines = cleanedText.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty lines act as paragraph breaks
        if (!trimmed) {
          return <View key={idx} style={styles.paragraphSpacer} />;
        }

        // Bullet points (- or * or •)
        const bulletMatch = trimmed.match(/^([-\*•])\s+(.*)/);
        if (bulletMatch) {
          const content = bulletMatch[2];
          return (
            <View key={idx} style={styles.bulletRow}>
              <Text style={[style, styles.bulletSymbol]}>•</Text>
              <Text style={[style, styles.bulletContent]}>
                {parseInlineSpans(content, style)}
              </Text>
            </View>
          );
        }

        // Headers (# Header, ## Header, ### Header)
        const headerMatch = trimmed.match(/^(#{1,3})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2];
          const headerFontSize = (style?.fontSize || 14) + (4 - level) * 2;
          return (
            <Text
              key={idx}
              style={[
                style,
                styles.headerText,
                { fontSize: headerFontSize, marginTop: 6, marginBottom: 4 }
              ]}
            >
              {parseInlineSpans(content, style)}
            </Text>
          );
        }

        // Standard Paragraph line
        return (
          <Text key={idx} style={[style, styles.lineText]}>
            {parseInlineSpans(line, style)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraphSpacer: {
    height: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletSymbol: {
    fontWeight: '700',
    marginRight: 6,
    lineHeight: 21,
  },
  bulletContent: {
    flex: 1,
    lineHeight: 21,
  },
  headerText: {
    fontWeight: '700',
    lineHeight: 24,
  },
  lineText: {
    lineHeight: 21,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
});
