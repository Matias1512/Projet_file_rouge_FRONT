import { FaFire, FaFlask, FaFileAlt, FaShieldAlt, FaBullseye, FaTrophy, FaStar, FaBolt, FaPlay, FaLeaf, FaHeart, FaCheckCircle, FaCompass } from "react-icons/fa";

// Mapping des icônes
export const getIcon = (iconName, size = 32) => {
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
    'FaTarget': <FaBullseye size={size} />,
    'FaCompass': <FaCompass size={size} />
  };
  
  return iconMap[iconName] || <FaStar size={size} />;
};