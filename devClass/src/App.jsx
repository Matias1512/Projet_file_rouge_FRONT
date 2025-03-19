import { Box } from "@chakra-ui/react"
import CodeEditor from "./components/CodeEditor"

import { ChakraProvider } from "@chakra-ui/react";
import { LayoutNavBar } from "./components/NavBar";
import { Lessons } from "./components/Lessons";
import AchievementsPage from "./components/Badges";

function App() {

  return (
    // <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
    // <CodeEditor />
    // </Box>
    <ChakraProvider>
      <LayoutNavBar>
        <AchievementsPage /> 
      </LayoutNavBar>
    </ChakraProvider>
  )
}

export default App
