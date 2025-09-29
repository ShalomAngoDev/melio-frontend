import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  period: string;
  totalAlerts: number;
  newAlerts: number;
  inProgressAlerts: number;
  resolvedAlerts: number;
  totalReports: number;
  newReports: number;
  inProgressReports: number;
  resolvedReports: number;
  studentsCount: number;
  averageResponseTime: string;
  trends: {
    alerts: number[];
    reports: number[];
  };
  schoolInfo?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
  alertsByRiskLevel?: {
    CRITIQUE: number;
    ELEVE: number;
    MOYEN: number;
    FAIBLE: number;
  };
  reportsByUrgency?: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  generateReport(data: ReportData, reportType: string, period: string): void {
    // Vérifier que les données existent
    if (!data) {
      throw new Error('Aucune donnée de rapport fournie');
    }

    // Configuration de la page
    this.doc.setProperties({
      title: `Rapport ${reportType} - ${data.schoolInfo?.name || 'École'}`,
      subject: `Rapport de sécurité scolaire - ${period}`,
      author: 'Système Melio',
      creator: 'Melio - Protection scolaire'
    });

    // En-tête
    this.addHeader(data);
    
    // Contenu selon le type de rapport
    switch (reportType) {
      case 'summary':
        this.addSummaryContent(data);
        break;
      case 'detailed':
        this.addDetailedContent(data);
        break;
      case 'trends':
        this.addTrendsContent(data);
        break;
      case 'compliance':
        this.addComplianceContent(data);
        break;
      default:
        this.addSummaryContent(data);
    }

    // Pied de page
    this.addFooter();

    // Télécharger le PDF
    const fileName = `rapport-${reportType}-${data.schoolInfo?.name?.replace(/\s+/g, '-').toLowerCase() || 'ecole'}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }

  private addHeader(data: ReportData): void {
    // Logo et titre principal
    this.doc.setFontSize(24);
    this.doc.setTextColor(59, 130, 246); // Bleu
    this.doc.text('MELIO', 20, 30);
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(75, 85, 99); // Gris foncé
    this.doc.text('Protection Scolaire', 20, 40);

    // Informations de l'école
    this.doc.setFontSize(14);
    this.doc.setTextColor(31, 41, 55); // Gris très foncé
    this.doc.text(data.schoolInfo?.name || 'École', 20, 55);
    
    if (data.schoolInfo?.address || data.schoolInfo?.postalCode || data.schoolInfo?.city) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(107, 114, 128); // Gris moyen
      const address = [
        data.schoolInfo?.address,
        data.schoolInfo?.postalCode,
        data.schoolInfo?.city
      ].filter(Boolean).join(', ');
      this.doc.text(address || 'Adresse non disponible', 20, 62);
    }

    // Informations du rapport
    this.doc.setFontSize(12);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 75);
    this.doc.text(`Période: ${this.getPeriodLabel(data.period)}`, 20, 82);

    // Ligne de séparation
    this.doc.setDrawColor(229, 231, 235);
    this.doc.line(20, 90, 190, 90);
  }

  private addSummaryContent(data: ReportData): void {
    let yPosition = 100;

    // Titre de section
    this.doc.setFontSize(16);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Résumé Exécutif', 20, yPosition);
    yPosition += 15;

    // Métriques principales
    this.doc.setFontSize(12);
    this.doc.setTextColor(75, 85, 99);
    
    const metrics = [
      { label: 'Total des alertes', value: (data.totalAlerts || 0).toString() },
      { label: 'Nouvelles alertes', value: (data.newAlerts || 0).toString() },
      { label: 'Alertes en cours', value: (data.inProgressAlerts || 0).toString() },
      { label: 'Alertes résolues', value: (data.resolvedAlerts || 0).toString() },
      { label: 'Total des signalements', value: (data.totalReports || 0).toString() },
      { label: 'Nouveaux signalements', value: (data.newReports || 0).toString() },
      { label: 'Signalements en cours', value: (data.inProgressReports || 0).toString() },
      { label: 'Signalements traités', value: (data.resolvedReports || 0).toString() },
      { label: 'Nombre d\'élèves', value: (data.studentsCount || 0).toString() },
      { label: 'Temps de réponse moyen', value: data.averageResponseTime || 'N/A' }
    ];

    // Tableau des métriques
    const tableData = metrics.map(metric => [metric.label, metric.value]);
    
    autoTable(this.doc, {
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [31, 41, 55]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 20;

    // Répartition par niveau de risque
    if (data.alertsByRiskLevel) {
      this.doc.setFontSize(14);
      this.doc.setTextColor(31, 41, 55);
      this.doc.text('Répartition des Alertes par Niveau de Risque', 20, yPosition);
      yPosition += 15;

      const riskData = [
        ['Critique', (data.alertsByRiskLevel?.CRITIQUE || 0).toString()],
        ['Élevé', (data.alertsByRiskLevel?.ELEVE || 0).toString()],
        ['Moyen', (data.alertsByRiskLevel?.MOYEN || 0).toString()],
        ['Faible', (data.alertsByRiskLevel?.FAIBLE || 0).toString()]
      ];

      autoTable(this.doc, {
        startY: yPosition,
        head: [['Niveau de Risque', 'Nombre d\'Alertes']],
        body: riskData,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [254, 242, 242]
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 20;
    }

    // Répartition des signalements par urgence
    if (data.reportsByUrgency) {
      this.doc.setFontSize(14);
      this.doc.setTextColor(31, 41, 55);
      this.doc.text('Répartition des Signalements par Urgence', 20, yPosition);
      yPosition += 15;

      const urgencyData = [
        ['Critique', (data.reportsByUrgency?.CRITICAL || 0).toString()],
        ['Élevée', (data.reportsByUrgency?.HIGH || 0).toString()],
        ['Moyenne', (data.reportsByUrgency?.MEDIUM || 0).toString()],
        ['Faible', (data.reportsByUrgency?.LOW || 0).toString()]
      ];

      autoTable(this.doc, {
        startY: yPosition,
        head: [['Niveau d\'Urgence', 'Nombre de Signalements']],
        body: urgencyData,
        theme: 'grid',
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255]
        },
        margin: { left: 20, right: 20 }
      });
    }
  }

  private addDetailedContent(data: ReportData): void {
    // Implémentation pour rapport détaillé
    this.addSummaryContent(data);
    
    // Ajouter des sections supplémentaires
    this.doc.addPage();
    this.doc.setFontSize(16);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Analyse Détaillée', 20, 30);
    
    // Graphiques et analyses plus poussées
    this.doc.setFontSize(12);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('Cette section contiendrait une analyse plus approfondie des données...', 20, 50);
  }

  private addTrendsContent(data: ReportData): void {
    // Implémentation pour rapport de tendances
    this.addSummaryContent(data);
    
    this.doc.addPage();
    this.doc.setFontSize(16);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Analyse des Tendances', 20, 30);
    
    // Graphiques de tendances
    this.doc.setFontSize(12);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('Évolution des alertes et signalements dans le temps...', 20, 50);
  }

  private addComplianceContent(data: ReportData): void {
    // Implémentation pour rapport de conformité
    this.addSummaryContent(data);
    
    this.doc.addPage();
    this.doc.setFontSize(16);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Rapport de Conformité', 20, 30);
    
    // Métriques de conformité
    this.doc.setFontSize(12);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('Respect des procédures et délais de traitement...', 20, 50);
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Numéro de page
      this.doc.setFontSize(10);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
      
      // Copyright
      this.doc.text('© 2024 Melio - Protection Scolaire', 150, 285);
    }
  }

  private getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      '7d': '7 derniers jours',
      '30d': '30 derniers jours',
      '90d': '3 derniers mois',
      '1y': '1 an'
    };
    return labels[period] || period;
  }
}

export const pdfGenerator = new PDFReportGenerator();
