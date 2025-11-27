"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CardInfo {
  id: string;
  cardNumber: string;
}

interface CardSelectionTableProps {
  cards: CardInfo[];
  onSelectCard: (cardId: string) => void;
  onBack: () => void;
}

export function CardSelectionTable({
  cards,
  onSelectCard,
  onBack,
}: CardSelectionTableProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  const handleSelect = () => {
    if (!selectedCardId) {
      return;
    }
    onSelectCard(selectedCardId);
  };

  // Format card number to show only last 4 digits
  const formatCardNumber = (cardNumber: string) => {
    if (cardNumber.length <= 4) return cardNumber;
    const lastFour = cardNumber.slice(-4);
    const masked = "**** **** **** ";
    return masked + lastFour;
  };

  if (cards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          No se encontraron tarjetas asociadas a este cliente.
        </div>
        <Button
          onClick={onBack}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          Regresar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-800">
        Selecciona una tarjeta para pago
      </h3>

      {/* Info message */}
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded">
        Selecciona la tarjeta del cliente para proceder al pago.
      </div>

      {/* Cards Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold text-gray-700">
                Número de Tarjeta
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow
                key={card.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedCardId === card.id ? "bg-blue-50 hover:bg-blue-100" : ""
                }`}
                onClick={() => setSelectedCardId(card.id)}
              >
                <TableCell>
                  <RadioGroup
                    value={selectedCardId}
                    onValueChange={setSelectedCardId}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value={card.id} id={card.id} />
                    </div>
                  </RadioGroup>
                </TableCell>
                <TableCell className="font-mono font-medium text-gray-900 text-lg">
                  {formatCardNumber(card.cardNumber)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSelect}
          disabled={!selectedCardId}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Seleccionar Tarjeta
        </Button>
        <Button
          onClick={onBack}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          Regresar
        </Button>
      </div>
    </div>
  );
}
