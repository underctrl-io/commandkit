import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for command latency
const commandLatency = [
  {
    id: "1",
    command: "!help",
    averageLatency: 45,
    minLatency: 32,
    maxLatency: 78,
    p95Latency: 65,
    calls: 1245,
  },
  {
    id: "2",
    command: "!ping",
    averageLatency: 28,
    minLatency: 18,
    maxLatency: 52,
    p95Latency: 42,
    calls: 876,
  },
  {
    id: "3",
    command: "!ban",
    averageLatency: 120,
    minLatency: 98,
    maxLatency: 210,
    p95Latency: 180,
    calls: 234,
  },
  {
    id: "4",
    command: "!kick",
    averageLatency: 115,
    minLatency: 95,
    maxLatency: 190,
    p95Latency: 175,
    calls: 189,
  },
  {
    id: "5",
    command: "!play",
    averageLatency: 230,
    minLatency: 180,
    maxLatency: 450,
    p95Latency: 380,
    calls: 567,
  },
  {
    id: "6",
    command: "!skip",
    averageLatency: 85,
    minLatency: 65,
    maxLatency: 140,
    p95Latency: 120,
    calls: 432,
  },
  {
    id: "7",
    command: "!queue",
    averageLatency: 95,
    minLatency: 75,
    maxLatency: 160,
    p95Latency: 140,
    calls: 321,
  },
]

export function CommandLatencyTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Command</TableHead>
          <TableHead className="text-right">Avg (ms)</TableHead>
          <TableHead className="text-right hidden md:table-cell">Min (ms)</TableHead>
          <TableHead className="text-right hidden md:table-cell">Max (ms)</TableHead>
          <TableHead className="text-right hidden md:table-cell">p95 (ms)</TableHead>
          <TableHead className="text-right">Calls</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commandLatency.map((command) => (
          <TableRow key={command.id}>
            <TableCell className="font-medium">{command.command}</TableCell>
            <TableCell className="text-right">{command.averageLatency}</TableCell>
            <TableCell className="text-right hidden md:table-cell">{command.minLatency}</TableCell>
            <TableCell className="text-right hidden md:table-cell">{command.maxLatency}</TableCell>
            <TableCell className="text-right hidden md:table-cell">{command.p95Latency}</TableCell>
            <TableCell className="text-right">{command.calls}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

