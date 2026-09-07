import { Component, inject } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { OutputService } from '../../services/output-service';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-outputs',
  imports: [TableOfContent, RouterLink],
  templateUrl: './outputs.html',
  styleUrl: './outputs.css',
})
export class Outputs extends BaseCrud<any> {

  tableColumns = OutputColumns
  filteringOutput: boolean = false

  private outputService = inject(OutputService);
  override getService() { return this.outputService }

  constructor() { super(); }
}
