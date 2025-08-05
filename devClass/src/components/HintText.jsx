import { Text, Button, Box } from "@chakra-ui/react";
import { useState } from "react";
import PropTypes from "prop-types";

const HintText = ({ text, color }) => {
    const [revealedHints, setRevealedHints] = useState(new Set());

    const parseTextWithHints = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const hintText = part.slice(2, -2);
                const hintId = `hint-${index}`;
                const isRevealed = revealedHints.has(hintId);
                
                return (
                    <Box key={index} display="inline">
                        {isRevealed ? (
                            <Text as="span" fontWeight="bold">
                                {hintText}
                            </Text>
                        ) : (
                            <Button
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => {
                                    setRevealedHints(prev => new Set([...prev, hintId]));
                                }}
                                mx={1}
                            >
                                indice
                            </Button>
                        )}
                    </Box>
                );
            }
            return part.split('\n').map((line, lineIndex) => (
                <span key={`${index}-${lineIndex}`}>
                    {line}
                    {lineIndex < part.split('\n').length - 1 && <br />}
                </span>
            ));
        });
    };

    return (
        <Text color={color} fontSize="sm">
            {parseTextWithHints(text)}
        </Text>
    );
};

HintText.propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.string
};

export default HintText;