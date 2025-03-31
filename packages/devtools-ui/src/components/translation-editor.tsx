import { useState } from "react"
import { Search, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

// Mock data for translations
const getTranslations = (locale: string) => [
  {
    id: "1",
    key: "commands.help.title",
    defaultValue: "Help Menu",
    value: locale === "en-US" ? "Help Menu" : "",
  },
  {
    id: "2",
    key: "commands.help.description",
    defaultValue: "Displays a list of available commands",
    value: locale === "en-US" ? "Displays a list of available commands" : "",
  },
  {
    id: "3",
    key: "commands.ping.title",
    defaultValue: "Ping Command",
    value: locale === "en-US" ? "Ping Command" : "",
  },
  {
    id: "4",
    key: "commands.ping.description",
    defaultValue: "Checks the bot's latency",
    value: locale === "en-US" ? "Checks the bot's latency" : "",
  },
  {
    id: "5",
    key: "commands.ban.title",
    defaultValue: "Ban Command",
    value: locale === "en-US" ? "Ban Command" : "",
  },
  {
    id: "6",
    key: "commands.ban.description",
    defaultValue: "Bans a user from the server",
    value: locale === "en-US" ? "Bans a user from the server" : "",
  },
  {
    id: "7",
    key: "errors.permission_denied",
    defaultValue: "You don't have permission to use this command",
    value: locale === "en-US" ? "You don't have permission to use this command" : "",
  },
  {
    id: "8",
    key: "errors.command_cooldown",
    defaultValue: "Please wait {seconds} seconds before using this command again",
    value: locale === "en-US" ? "Please wait {seconds} seconds before using this command again" : "",
  },
]

export function TranslationEditor({ locale }: { locale: string }) {
  const [translations, setTranslations] = useState(getTranslations(locale))
  const [searchTerm, setSearchTerm] = useState("")

  const handleTranslationChange = (id: string, value: string) => {
    setTranslations(
      translations.map((translation) => (translation.id === id ? { ...translation, value } : translation)),
    )
  }

  const filteredTranslations = translations.filter(
    (translation) =>
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.defaultValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.value.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search translations..."
          className="max-w-sm"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Key</TableHead>
            <TableHead>Default Value (en-US)</TableHead>
            <TableHead>Translation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTranslations.map((translation) => (
            <TableRow key={translation.id}>
              <TableCell className="font-mono text-xs">{translation.key}</TableCell>
              <TableCell>{translation.defaultValue}</TableCell>
              <TableCell>
                <Textarea
                  value={translation.value}
                  onChange={(e) => handleTranslationChange(translation.id, e.target.value)}
                  placeholder={`Translate to ${locale}`}
                  className="min-h-[60px]"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

