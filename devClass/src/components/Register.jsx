import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, VStack, Heading, IconButton, Flex, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false); // Ajout d'un état pour gérer le chargement
  const navigate = useNavigate();
  const toast = useToast(); // Pour afficher des messages de succès ou d'erreur
  const { isAuthenticated } = useAuth(); // Assurez-vous d'importer le contexte d'authentification
  
  const navigateToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigateToHome();
    }
  }, [isAuthenticated, navigateToHome]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Met l'état de chargement à vrai
    console.log("Nom:", name, "Email:", email, "Password:", password);
    const userData = {
      "username": name,
      "email": email,
      "passwordHash": password,
      "role": "user" // Envoi du mot de passe sous "passwordHash"
    };
    axios.post("https://schooldev.duckdns.org/api/auth/register", userData)
      .then(() => {
        toast({
          title: "Inscription réussie !",
          description: "Tu peux maintenant te connecter.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      })
      .catch(error => {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Une erreur est survenue.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      }); // Met l'état de chargement à faux après la requête
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#121920"
      color="white"
    >
        {/* Bouton "Se connecter" en haut à droite */}
            <Flex position="absolute" top={4} right={4}>
                <Button
                    bg="#39b4e9"
                    color="black"
                    _hover={{ bg: "#2da8dd" }}
                    onClick={() => navigate("/login")} // Redirection vers la page se connecter
                >
                Se connecter
                </Button>
            </Flex>

      <Box w="full" maxW="md" p={4}>
        <Heading mb={8} textAlign="center" fontSize="2xl">
          Crée ton profil
        </Heading>


        <VStack as="form" onSubmit={handleSubmit} spacing={4}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            bg="#1e2730"
            color="white"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
            size="lg"
            required
          />

          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            bg="#1e2730"
            color="white"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
            size="lg"
            required
          />

          <Box position="relative" w="full">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              bg="#1e2730"
              color="white"
              _placeholder={{ color: "gray.400" }}
              _focus={{ borderColor: "#39b4e9", boxShadow: "0 0 0 1px #39b4e9" }}
              size="lg"
              pr="3rem" // Ajoute de l'espace pour le bouton d'affichage
              required
            />
            <IconButton
              position="absolute"
              top="50%"
              right="4"
              transform="translateY(-50%)"
              bg="transparent"
              color="#39b4e9"
              _hover={{ bg: "transparent" }}
              onClick={() => setShowPassword(!showPassword)}
            />
          </Box>

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
            CRÉER MON COMPTE
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Register;
