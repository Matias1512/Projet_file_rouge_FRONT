import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Input, VStack, Heading, Flex, useToast } from "@chakra-ui/react";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast(); // Pour afficher des messages de succès ou d'erreur

    const handleLogin = async () => {
        try {
            const response = await fetch(
                `https://schooldev.duckdns.org/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                { method: "GET" }
            );
    
            if (!response.ok) {
                throw new Error("Échec de la connexion. Vérifie tes identifiants.");
            }
    
            const userData = await response.json();
            login(userData); // Stocker les données réelles de l'utilisateur
            navigate("/"); // Redirection après connexion
        } catch (error) {
            console.error("Erreur de connexion :", error.message);
            toast({
                title: "Erreur",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
              });
        }
    };

    return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="#121920"
          color="white"
          position="relative"
        >
          {/* Bouton "S'inscrire" en haut à droite */}
          <Flex position="absolute" top={4} right={4}>
            <Button
              bg="#39b4e9"
              color="black"
              _hover={{ bg: "#2da8dd" }}
              onClick={() => navigate("/register")} // Redirection vers la page d'inscription
            >
              S'inscrire
            </Button>
          </Flex>
    
          <Box w="full" maxW="md" p={4}>
            <Heading mb={8} textAlign="center" fontSize="2xl">
              Connexion
            </Heading>
    
            <VStack as="form" onSubmit={handleLogin} spacing={4}>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                bg="#1e2730"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
                size="lg"
              />
    
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                bg="#1e2730"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
                size="lg"
              />
    
              <Button
                type="submit"
                w="full"
                bg="#39b4e9"
                color="black"
                size="lg"
                _hover={{ bg: "#2da8dd" }}
              >
                SE CONNECTER
              </Button>
            </VStack>
          </Box>
        </Box>
      );
    };

export default Login;
