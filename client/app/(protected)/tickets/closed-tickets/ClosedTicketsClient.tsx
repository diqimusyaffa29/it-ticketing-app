'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getImageUrl } from '@/helper/getImageUrl'
import { renderStatusBadge } from '@/helper/renderStatusBadge'
import { getUserRole } from '@/lib/auth'
import api from '@/lib/axios'
import { Ticket } from '@/types/commonType'
import React, { useCallback, useEffect, useState } from 'react'

const ClosedTicketsClient = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)

  // state untuk memilih ticketnya 
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const closedTickets = useCallback(async () => {
    try {
      const res = await api.get('/tickets/closed');
      const allTickets = res.data.data || res.data
      const closedTickets = allTickets.filter((t: Ticket) => t.status === "CLOSED")
      console.log(closedTickets);
      setTickets(closedTickets);
    } catch {
      setError('Failed to get tickets from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(getUserRole())
    closedTickets();
  }, [closedTickets]);

  // function untuk melihat detail ticket yang sudah closed
  const openDetailModal = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
  }


  const DetailButton = ({ ticket }: { ticket: Ticket }) => {
    return (
      <Button
        variant={"outline"}
        size={"sm"}
        className='w-full sm:w-auto'
        onClick={() => openDetailModal(ticket)}
      >Details</Button>
    )
  }
  return (
    <div className="space-y-6 px-3 sm:px-0">
      {/* HEADER: stack vertikal di mobile, sejajar di sm ke atas */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CLOSED TICKETS PAGE</h1>
          <p className="text-muted-foreground text-sm">
            List of complaint tickets and assignment management that has been closed
          </p>
        </div>

        {/* Modal Update Status Tiket */}
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
        }}>
          <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg wrap-break-word">
                Details Ticket #{selectedTicket?.id}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Ticket Title</label>
                <p>{selectedTicket?.title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket?.description || ''}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ticket Status</label>
                <Select disabled value={selectedTicket?.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OPEN">OPEN (Menunggu)</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN PROGRESS (Sedang Dikerjakan)</SelectItem>
                      <SelectItem value="RESOLVED">RESOLVED (Selesai/Terselesaikan)</SelectItem>
                      <SelectItem value="CLOSED">CLOSED (Ditutup)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* <select
                  disabled
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedTicket?.status}
                // onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="OPEN">OPEN (Menunggu)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Sedang Dikerjakan)</option>
                  <option value="RESOLVED">RESOLVED (Selesai/Terselesaikan)</option>
                  <option value="CLOSED">CLOSED (Ditutup)</option>
                </select> */}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Closed Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading Tickets...</p>
          ) : error ? (
            <p className="text-center py-8 text-red-500">{error}</p>
          ) : tickets.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No Closed tickets yet.</p>
          ) : (
            <>
              {/* ===== TAMPILAN TABEL — hanya muncul di md ke atas ===== */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">No. Ticket</TableHead>
                      <TableHead className="text-center">Title</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Priority</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">Reporter Account</TableHead>
                      <TableHead className="text-center">Reporter Name</TableHead>
                      <TableHead className="text-center">Technician</TableHead>
                      <TableHead className="text-center">Evidence of Work</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket, index: number) => (
                      <TableRow key={ticket.id || `ticket-${index}`} className="text-center">
                        <TableCell className="font-semibold">#{ticket.id.slice(0, 8)}.....</TableCell>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          <span className={`font-mono text-xs font-semibold px-2 py-1 rounded ${ticket.priority == "HIGH" ? "bg-red-500 text-white" : ticket.priority == "MEDIUM" ? "bg-yellow-500 text-white" : "bg-background"}`} >
                            {ticket.priority}
                          </span>
                        </TableCell>
                        <TableCell>{ticket.unit || '-'}</TableCell>
                        <TableCell>{ticket.reporter?.Name || '-'}</TableCell>
                        <TableCell>{ticket.reporter_name || '-'}</TableCell>
                        <TableCell>{ticket.assignee?.Name || 'Unassigned'}</TableCell>
                        <TableCell>
                          {ticket.proof_image ? (
                            <a
                              href={getImageUrl(ticket.proof_image)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline font-medium hover:text-blue-800"
                            >
                              See work proof Picture
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <DetailButton ticket={ticket} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ===== TAMPILAN CARD — hanya muncul di bawah md (mobile) ===== */}
              <div className="md:hidden space-y-3">
                {tickets.map((ticket, index: number) => (
                  <div
                    key={ticket.id || `ticket-card-${index}`}
                    className="border rounded-lg p-4 space-y-2 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
                        <p className="font-semibold leading-snug">{ticket.title}</p>
                      </div>
                      {renderStatusBadge(ticket.status)}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`font-mono font-semibold px-2 py-1 rounded ${ticket.priority == "HIGH" ? "bg-red-500 text-white" : ticket.priority == "MEDIUM" ? "bg-yellow-500 text-white" : "bg-slate-100"}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-100">{ticket.unit || '-'}</span>
                    </div>

                    <div className="text-sm grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                      <span className="text-muted-foreground">Reporter Account</span>
                      <span className="text-right">{ticket.reporter?.Name || '-'}</span>

                      <span className="text-muted-foreground">Reporter Name</span>
                      <span className="text-right">{ticket.reporter_name || '-'}</span>

                      <span className="text-muted-foreground">Technician</span>
                      <span className="text-right">{ticket.assignee?.Name || 'Unassigned'}</span>
                    </div>

                    {ticket.proof_image ? (
                      <a
                        href={getImageUrl(ticket.proof_image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline font-medium block"
                      >
                        See work proof Picture
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">No proof image</p>
                    )}

                    <div className="space-x-2">
                      <DetailButton ticket={ticket} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClosedTicketsClient
