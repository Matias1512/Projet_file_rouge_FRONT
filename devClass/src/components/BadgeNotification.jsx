import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  useDisclosure
} from "@chakra-ui/react";
import { FaTrophy, FaStar, FaFire, FaFlask, FaFileAlt, FaShieldAlt, FaBullseye, FaBolt, FaPlay, FaLeaf, FaHeart, FaCheckCircle, FaTarget, FaCompass } from "react-icons/fa";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// Mapping des icônes (réutilisé depuis Badges.jsx)
const getIcon = (iconName, size = 32) => {
  const iconMap = {
    'FaFire': <FaFire size={size} />,
    'FaFlask': <FaFlask size={size} />,
    'FaFileAlt': <FaFileAlt size={size} />,
    'FaShieldAlt': <FaShieldAlt size={size} />,
    'FaBullseye': <FaBullseye size={size} />,
    'FaTrophy': <FaTrophy size={size} />,
    'FaStar': <FaStar size={size} />,
    'FaBolt': <FaBolt size={size} />,
    'FaPlay': <FaPlay size={size} />,
    'FaLeaf': <FaLeaf size={size} />,
    'FaHeart': <FaHeart size={size} />,
    'FaCheckCircle': <FaCheckCircle size={size} />,
    'FaTarget': <FaTarget size={size} />,
    'FaCompass': <FaCompass size={size} />
  };
  
  return iconMap[iconName] || <FaStar size={size} />;
};

const BadgeNotification = ({ badges, isOpen, onClose }) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (badges.length > 0 && isOpen) {
      setCurrentBadgeIndex(0);
    }
  }, [badges, isOpen]);

  const handleNext = () => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentBadgeIndex > 0) {
      setCurrentBadgeIndex(currentBadgeIndex - 1);
    }
  };

  if (!badges || badges.length === 0) {
    return null;
  }

  const currentBadge = badges[currentBadgeIndex];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="gradient" bgGradient="linear(to-br, yellow.400, orange.400)" color="white" textAlign="center">
        <ModalHeader>
          <VStack spacing={2}>
            <FaTrophy size={48} color="white" />
            <Text fontSize="2xl" fontWeight="bold">
              Nouveau badge débloqué !
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody py={6}>
          <VStack spacing={4}>
            <Box
              p={6}
              bg="white"
              borderRadius="full"
              boxShadow="xl"
              position="relative"
            >
              <Box color={currentBadge.color}>
                {getIcon(currentBadge.icon, 64)}
              </Box>
              <Badge
                position="absolute"
                bottom={-1}
                right={-1}
                bg="orange.500"
                color="white"
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="full"
              >
                {currentBadge.level}
              </Badge>
            </Box>

            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {currentBadge.title}
              </Text>
              <Text fontSize="md" color="white" opacity={0.9}>
                {currentBadge.description}
              </Text>
            </VStack>

            {badges.length > 1 && (
              <Text fontSize="sm" color="white" opacity={0.8}>
                Badge {currentBadgeIndex + 1} sur {badges.length}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <HStack spacing={3}>
            {badges.length > 1 && currentBadgeIndex > 0 && (
              <Button 
                variant="outline" 
                colorScheme="whiteAlpha" 
                onClick={handlePrevious}
              >
                Précédent
              </Button>
            )}
            
            <Button 
              bg="white" 
              color="orange.500" 
              _hover={{ bg: "gray.100" }}
              onClick={handleNext}
            >
              {currentBadgeIndex < badges.length - 1 ? 'Suivant' : 'Fantastique !'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

BadgeNotification.propTypes = {
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default BadgeNotification;