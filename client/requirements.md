## Packages
framer-motion | Animations for recording states and transitions
lucide-react | Beautiful icons for the UI
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
The backend provides endpoints:
- POST /api/process-audio (FormData: audio, persona, agent) -> { originalText, enhancedText }
- POST /api/transcriptions (JSON: originalText, enhancedText, persona, agent) -> Saved record
- GET /api/transcriptions -> List of saved records

Styles should use a modern, clean aesthetic with gradients for the AI feel.
