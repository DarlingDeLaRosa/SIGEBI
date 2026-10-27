import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { OutputService } from '../../services/output-service';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { OutputDetail } from '../../dialog/output-detail/output-detail';

@Component({
  selector: 'app-outputs',
  imports: [TableOfContent, RouterLink],
  templateUrl: './outputs.html',
  styleUrl: './outputs.css',
})
export class Outputs extends BaseCrud<any> implements OnInit {

  tableColumns = OutputColumns
  filteringOutput: boolean = false

  private outputService = inject(OutputService);
  private dialogService = inject(DialogService);
  override getService() { return this.outputService }

  constructor() { super(); }

  ngOnInit(): void {
    this.loadData()
  }

  openDetail(id: number) { this.dialogService.open(OutputDetail, id); }
}
