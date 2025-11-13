import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/shared/interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
})
export class CvComponent implements OnInit {
  user?: User;
  @ViewChild('cvContent') cvContent!: ElementRef;
  message = '';
  messageType: 'success' | 'error' | 'warning' | 'info' | '' = '';


  constructor() {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      this.user = JSON.parse(session);
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toISOString().split('T')[0];
    } catch {
      return date;
    }
  }

  /** ✅ Exporta el CV a PDF */
  async exportPDF(): Promise<void> {
    if (!this.cvContent) return;

    this.showMessage('📄 Generando PDF...', 'info');

    const element = this.cvContent.nativeElement;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`CV_${this.user?.name || 'investigador'}.pdf`);
    this.showMessage('✅ PDF generado con éxito', 'success');
  }

  /** ✅ Genera link compartible (simulado por ahora) */
  shareCV(): void {
    const publicUrl = `${window.location.origin}/cv-view/${this.user?.id || 'demo'}`;
    navigator.clipboard.writeText(publicUrl);
    this.showMessage('🔗 Link copiado', 'info');
  }
  
  showMessage(text: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.message = text;
    this.messageType = type;

    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 2500);
  }

}
