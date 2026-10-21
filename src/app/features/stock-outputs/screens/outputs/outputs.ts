import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { OutputService } from '../../services/output-service';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { RouterLink } from '@angular/router';
import { OutputsFacade } from '../../facades/outputs-facade';

@Component({
  selector: 'app-outputs',
  imports: [TableOfContent, RouterLink],
  templateUrl: './outputs.html',
  styleUrl: './outputs.css',
  providers: [OutputsFacade]
})
export class Outputs extends BaseCrud<any> implements OnInit {

  tableColumns = OutputColumns
  filteringOutput: boolean = false

  facade = inject(OutputsFacade);
  private outputService = inject(OutputService);
  override getService() { return this.outputService }

  constructor() { super(); }

  ngOnInit(): void {
    this.loadData()
    this.facade.loadData();
  }
}
