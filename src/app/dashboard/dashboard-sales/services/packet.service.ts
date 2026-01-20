import { Injectable } from '@angular/core';
import { PacketOption, SalesLead } from '../models/sales.types';

@Injectable({
  providedIn: 'root',
})
export class PacketService {
  normalizePacketIdValue(rawId: any): number | null {
    if (rawId === null || rawId === undefined || rawId === '') {
      return null;
    }
    const numericValue =
      typeof rawId === 'string'
        ? Number(rawId)
        : typeof rawId === 'number'
        ? rawId
        : typeof rawId?.id === 'number'
        ? rawId.id
        : Number(rawId?.id ?? rawId);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  normalizePacketOption(
    packet: {
      id: number | string | null;
      name: string;
      price?: number | null;
    } | null
  ): PacketOption | null {
    if (!packet) {
      return null;
    }

    return {
      id: this.normalizePacketIdValue(packet.id),
      name: packet.name,
      price: packet.price ?? null,
    };
  }

  resolvePacketOption(
    packetId: number | null,
    allPackets: PacketOption[],
    fallbackName?: string,
    fallbackPrice?: number | null
  ): PacketOption | null {
    if (packetId === null) {
      return null;
    }
    const fromList = allPackets.find((opt) => opt.id === packetId);
    if (fromList) {
      return fromList;
    }
    if (fallbackName) {
      return {
        id: packetId,
        name: fallbackName,
        price: fallbackPrice ?? null,
      };
    }
    return null;
  }

  resolvePacketByBudget(budget: number | null, allPackets: PacketOption[]): PacketOption | null {
    if (budget === null || budget === undefined) {
      return null;
    }

    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget)) {
      return null;
    }

    const byIdMatch =
      allPackets.find((opt) => Number(opt.id) === numericBudget) ?? null;
    if (byIdMatch) {
      return byIdMatch;
    }

    const byPriceMatch =
      allPackets.find((opt) =>
        Number.isFinite(Number(opt.price))
          ? Number(opt.price) === numericBudget
          : false
      ) ?? null;

    return byPriceMatch;
  }

  attachPacketInfo(lead: any, allPackets: PacketOption[]): SalesLead {
    const rawPacketId = lead.packetId ?? lead.packet?.id ?? null;
    const normalizedPacketId = this.normalizePacketIdValue(rawPacketId);
    const packetName = lead.packetName || lead.packet?.name || null;
    const packetPrice =
      lead.packet?.price ?? lead.packetPrice ?? lead.productPrice ?? null;
    const packetOption =
      this.resolvePacketOption(
        normalizedPacketId,
        allPackets,
        packetName ?? undefined,
        packetPrice
      ) ?? this.resolvePacketByBudget(lead?.budget ?? null, allPackets);
    const finalPacketId = packetOption?.id ?? normalizedPacketId;
    return {
      ...lead,
      packetId: finalPacketId,
      packet: packetOption,
    };
  }

  getDefaultPacketOption(): PacketOption {
    return { id: null, name: 'لم تحدد', price: null };
  }

  getPacketDropdownOptions(allPackets: PacketOption[]): PacketOption[] {
    return [this.getDefaultPacketOption(), ...(allPackets || [])];
  }
}
