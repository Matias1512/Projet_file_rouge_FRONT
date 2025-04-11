import { useAuth } from "../AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Input, VStack, Heading, Flex, useToast } from "@chakra-ui/react";
import axios from "axios";

function Login() {

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast(); // Pour afficher des messages de succès ou d'erreur
    
    useEffect(() => {
      if (isAuthenticated) {
        navigate("/");
      }
    }, [isAuthenticated]);
    
    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      const userData = {
        username: name,
        password: password
      };
  
      try {
        const response = await axios.post("https://schooldev.duckdns.org/api/auth/login", userData);
        const token = response.data.token;
  
        if (token) {
          login(token); // 📌 stocke le token dans le contexte et le localStorage
          toast({
            title: "Connexion réussie !",
            description: "Bienvenue 🥳",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate("/");
        } else {
          throw new Error("Token manquant dans la réponse.");
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="username"
                bg="#1e2730"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
                size="lg"
                required
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
                required
              />
    
              <Button
                type="submit"
                w="full"
                bg="#39b4e9"
                color="black"
                size="lg"
                _hover={{ bg: "#2da8dd" }}
                mt={2}
                isLoading={loading} // Affiche le spinner pendant l'envoi des données
              >
                SE CONNECTER
              </Button>
            </VStack>
          </Box>
        </Box>
      );
    };

export default Login;
