/**
 * Tests de componente para SeatRenderer
 * Verifica el comportamiento del componente de asientos
 */

import React from 'react';
import { mount } from 'cypress/react18';
import SeatRenderer from '../../src/pages/steps/seatmaps/renderers/SeatRenderer';

describe('SeatRenderer Component', () => {
  const defaultProps = {
    sectionId: 'vip',
    rows: 5,
    seatsPerRow: 10,
    price: 100,
    color: '#FFD700',
    name: 'VIP',
    selectedSeats: [],
    occupiedSeats: [],
    blockedSeats: [],
    sectionBlocked: false,
    maxSeats: 6,
    onSeatSelect: cy.stub(),
    formatPrice: (price) => `€${price}`,
    event: {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Event',
      price: 50
    },
    calculateSeatPrice: cy.stub().returns(100)
  };

  beforeEach(() => {
    cy.stub(console, 'log');
  });

  it('debería renderizar correctamente', () => {
    mount(<SeatRenderer {...defaultProps} />);
    
    // Verificar que se renderiza la sección
    cy.get('[data-cy="seat-section"]').should('be.visible');
    cy.get('[data-cy="section-name"]').should('contain', 'VIP');
    cy.get('[data-cy="section-price"]').should('contain', '€100');
  });

  it('debería mostrar asientos disponibles', () => {
    mount(<SeatRenderer {...defaultProps} />);
    
    // Verificar que se muestran todos los asientos
    cy.get('[data-cy="seat-button"]').should('have.length', 50); // 5 rows * 10 seats
    cy.get('[data-cy="seat-button"]').first().should('have.class', 'available');
  });

  it('debería mostrar asientos ocupados', () => {
    const propsWithOccupied = {
      ...defaultProps,
      occupiedSeats: ['vip-1-1', 'vip-1-2']
    };
    
    mount(<SeatRenderer {...propsWithOccupied} />);
    
    // Verificar asientos ocupados
    cy.get('[data-cy="seat-vip-1-1"]').should('have.class', 'occupied');
    cy.get('[data-cy="seat-vip-1-2"]').should('have.class', 'occupied');
  });

  it('debería mostrar asientos seleccionados', () => {
    const propsWithSelected = {
      ...defaultProps,
      selectedSeats: [
        { id: 'vip-1-1', sectionId: 'vip', row: 1, seat: 1, price: 100 }
      ]
    };
    
    mount(<SeatRenderer {...propsWithSelected} />);
    
    // Verificar asiento seleccionado
    cy.get('[data-cy="seat-vip-1-1"]').should('have.class', 'selected');
  });

  it('debería manejar clics en asientos', () => {
    mount(<SeatRenderer {...defaultProps} />);
    
    // Hacer clic en un asiento
    cy.get('[data-cy="seat-vip-1-1"]').click();
    
    // Verificar que se llama la función onSeatSelect
    cy.wrap(defaultProps.onSeatSelect).should('have.been.called');
  });

  it('debería deshabilitar asientos ocupados', () => {
    const propsWithOccupied = {
      ...defaultProps,
      occupiedSeats: ['vip-1-1']
    };
    
    mount(<SeatRenderer {...propsWithOccupied} />);
    
    // Verificar que el asiento ocupado está deshabilitado
    cy.get('[data-cy="seat-vip-1-1"]').should('be.disabled');
  });

  it('debería mostrar tooltips en hover', () => {
    mount(<SeatRenderer {...defaultProps} />);
    
    // Hacer hover sobre un asiento
    cy.get('[data-cy="seat-vip-1-1"]').trigger('mouseenter');
    
    // Verificar que se muestra el tooltip
    cy.get('[data-cy="seat-tooltip"]').should('be.visible');
    cy.get('[data-cy="seat-tooltip"]').should('contain', 'VIP Fila 1 Asiento 1');
  });

  it('debería respetar el límite máximo de asientos', () => {
    const propsWithMaxSeats = {
      ...defaultProps,
      selectedSeats: [
        { id: 'vip-1-1', sectionId: 'vip', row: 1, seat: 1, price: 100 },
        { id: 'vip-1-2', sectionId: 'vip', row: 1, seat: 2, price: 100 },
        { id: 'vip-1-3', sectionId: 'vip', row: 1, seat: 3, price: 100 },
        { id: 'vip-1-4', sectionId: 'vip', row: 1, seat: 4, price: 100 },
        { id: 'vip-1-5', sectionId: 'vip', row: 1, seat: 5, price: 100 },
        { id: 'vip-1-6', sectionId: 'vip', row: 1, seat: 6, price: 100 }
      ],
      maxSeats: 6
    };
    
    mount(<SeatRenderer {...propsWithMaxSeats} />);
    
    // Verificar que no se puede seleccionar más asientos
    cy.get('[data-cy="seat-vip-2-1"]').should('have.class', 'disabled');
  });

  it('debería ser responsive en móvil', () => {
    cy.viewport(375, 667); // iPhone SE
    
    mount(<SeatRenderer {...defaultProps} />);
    
    // Verificar que los asientos se adaptan al móvil
    cy.get('[data-cy="seat-button"]').should('have.css', 'width', '18px');
    cy.get('[data-cy="seat-button"]').should('have.css', 'height', '18px');
  });

  it('debería mostrar sección bloqueada', () => {
    const propsWithBlocked = {
      ...defaultProps,
      sectionBlocked: true
    };
    
    mount(<SeatRenderer {...propsWithBlocked} />);
    
    // Verificar que todos los asientos están bloqueados
    cy.get('[data-cy="seat-button"]').should('have.class', 'blocked');
    cy.get('[data-cy="section-blocked-message"]').should('be.visible');
  });
});
