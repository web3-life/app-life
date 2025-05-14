"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card } from "@/components/ui/card"
import { ArrowDownUp, MessageCircle, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define transaction types
type TransactionType = "Deposit" | "Exchange" | "Chat"
type TransactionStatus = "Completed" | "Pending Calculation"

interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  timestamp: Date
}

// 为了避免在服务端和客户端生成不同的事务数据，我们将定义固定的事务
const fixedTransactions: Transaction[] = [
  {
    id: "tx-fixed-1",
    type: "Chat",
    status: "Pending Calculation",
    amount: -125,
    timestamp: new Date("2023-06-15T12:30:00"),
  },
  {
    id: "tx-fixed-2",
    type: "Chat",
    status: "Pending Calculation",
    amount: -220,
    timestamp: new Date("2023-06-15T12:00:00"),
  },
  {
    id: "tx-1",
    type: "Deposit",
    status: "Completed",
    amount: 1000,
    timestamp: new Date("2023-06-14T10:00:00"),
  },
  {
    id: "tx-2",
    type: "Exchange",
    status: "Completed",
    amount: -500,
    timestamp: new Date("2023-06-13T15:30:00"),
  },
  {
    id: "tx-3",
    type: "Deposit",
    status: "Completed",
    amount: 2500,
    timestamp: new Date("2023-06-12T09:15:00"),
  },
  {
    id: "tx-4",
    type: "Chat",
    status: "Pending Calculation",
    amount: -150,
    timestamp: new Date("2023-06-11T16:45:00"),
  },
  {
    id: "tx-5",
    type: "Exchange",
    status: "Completed",
    amount: 800,
    timestamp: new Date("2023-06-10T14:20:00"),
  },
  {
    id: "tx-6",
    type: "Chat",
    status: "Completed",
    amount: -100,
    timestamp: new Date("2023-06-09T11:10:00"),
  },
  {
    id: "tx-7",
    type: "Deposit",
    status: "Completed",
    amount: 3000,
    timestamp: new Date("2023-06-08T13:40:00"),
  },
  {
    id: "tx-8",
    type: "Exchange",
    status: "Pending Calculation",
    amount: -1200,
    timestamp: new Date("2023-06-07T17:00:00"),
  },
  {
    id: "tx-9",
    type: "Chat",
    status: "Completed",
    amount: -180,
    timestamp: new Date("2023-06-06T10:30:00"),
  },
  {
    id: "tx-10",
    type: "Deposit",
    status: "Completed",
    amount: 1500,
    timestamp: new Date("2023-06-05T09:00:00"),
  },
]

export default function TransactionHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(fixedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = fixedTransactions.slice(startIndex, endIndex)

  // Get icon based on transaction type
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "Deposit":
        return <Wallet className="h-4 w-4 text-green-400" />
      case "Exchange":
        return <ArrowDownUp className="h-4 w-4 text-blue-400" />
      case "Chat":
        return <MessageCircle className="h-4 w-4 text-purple-400" />
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 如果组件未挂载，返回静态结构
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500 text-purple-400 px-3 py-1">
              All Transactions
            </Badge>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
          <div className="p-6 flex justify-center items-center">
            <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
            <span>Loading transactions...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-purple-500 text-purple-400 px-3 py-1">
            All Transactions
          </Badge>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Amount (Life++)</TableHead>
              <TableHead className="text-gray-400 hidden md:table-cell">Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-gray-800 hover:bg-gray-900/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span>{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.status === "Completed" ? (
                    <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10">
                      Pending Calculation
                    </Badge>
                  )}
                  {transaction.status === "Pending Calculation" && (
                    <p className="text-xs text-gray-400 mt-1">Calculation occurs 3 minutes after session end</p>
                  )}
                </TableCell>
                <TableCell className={transaction.amount > 0 ? "text-green-400" : "text-red-400"}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell text-gray-400">
                  {formatDate(transaction.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // Show first page, last page, current page, and pages around current
            let pageToShow: number | null = null

            if (i === 0) pageToShow = 1
            else if (i === 4) pageToShow = totalPages
            else if (totalPages <= 5) pageToShow = i + 1
            else {
              // Complex pagination logic for many pages
              if (currentPage <= 3) {
                pageToShow = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i
              } else {
                if (i === 1) pageToShow = currentPage - 1
                else if (i === 2) pageToShow = currentPage
                else if (i === 3) pageToShow = currentPage + 1
                else pageToShow = null
              }
            }

            if (pageToShow === null) {
              return (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  onClick={() => setCurrentPage(pageToShow as number)}
                  isActive={currentPage === pageToShow}
                  className={currentPage === pageToShow ? "bg-purple-600 border-purple-500" : "cursor-pointer"}
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
